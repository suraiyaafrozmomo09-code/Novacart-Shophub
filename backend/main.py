"""NovaCart Backend API — Hybrid Recommendation Engine & Behavior Analytics.

Connects to Supabase (URL + anon key from .env) and serves:
- Hybrid personalized recommendations (KNN + SVD + FP-Growth + PrefixSpan)
- Product-page "frequently bought together"
- Session-based recommendations for anonymous visitors
- Behavioral event tracking (clicks, searches, sessions)
- Offline evaluation (RMSE, Precision@K, Recall@K, NDCG, MAP, Hit Rate)
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("novacart.api")

# ===========================================
# SUPABASE CONNECTION
# ===========================================

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

supabase_client = None
if SUPABASE_URL and SUPABASE_ANON_KEY:
    try:
        from supabase import create_client

        supabase_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        logger.info("Connected to Supabase at %s", SUPABASE_URL)
    except Exception as exc:  # pragma: no cover
        logger.error("Supabase connection failed: %s", exc)
else:
    logger.warning("SUPABASE_URL / SUPABASE_ANON_KEY not set; running without database")

# ===========================================
# RECOMMENDER SETUP
# ===========================================

from recommender.data_loader import DataLoader
from recommender.evaluation import Evaluator
from recommender.hybrid_ensemble import DEFAULT_WEIGHTS, HybridRecommender

data_loader: Optional[DataLoader] = DataLoader(supabase_client) if supabase_client else None
hybrid: Optional[HybridRecommender] = HybridRecommender(data_loader) if data_loader else None
evaluator: Optional[Evaluator] = Evaluator(data_loader) if data_loader else None

app = FastAPI(
    title="NovaCart Backend API",
    description="Hybrid Recommendation Engine (KNN + SVD + FP-Growth + PrefixSpan) & Behavior Analytics",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_db():
    if data_loader is None or hybrid is None:
        raise HTTPException(status_code=503, detail="Supabase connection not configured")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _clean(value: Any) -> Any:
    """Convert pandas NaN/NA/NaT to None for JSON serialization."""
    try:
        import pandas as pd

        if value is None or pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass
    return value


def enrich_products(entries: list[dict]) -> list[dict]:
    """Attach product metadata (name, category, price, image) to scored ids."""
    if not entries or data_loader is None:
        return entries
    products = data_loader.fetch_products()
    variants = data_loader.fetch_variants()
    product_map = (
        {row["id"]: row for row in products.to_dict("records")} if not products.empty else {}
    )
    price_map: dict[str, Any] = {}
    image_map: dict[str, Any] = {}
    if not variants.empty:
        for pid, group in variants.groupby("product_id"):
            price_map[pid] = float(group["price"].min())
            images = group["image"].dropna()
            image_map[pid] = images.iloc[0] if not images.empty else None

    enriched = []
    for entry in entries:
        pid = entry["product_id"]
        meta = product_map.get(pid)
        if meta is None:
            continue  # inactive/deleted product
        rating = _clean(meta.get("average_rating"))
        enriched.append({
            **entry,
            "name": _clean(meta.get("name")),
            "brand": _clean(meta.get("brand")),
            "category": _clean(meta.get("category_name")),
            "category_id": _clean(meta.get("category_id")),
            "product_type": _clean(meta.get("product_type")),
            "sub_type": _clean(meta.get("sub_type")),
            "average_rating": float(rating) if rating is not None else None,
            "price": price_map.get(pid, 0.0),  # BDT
            "image": _clean(image_map.get(pid)),
        })
    return enriched


def log_recommendations(
    user_id: Optional[str],
    session_id: Optional[str],
    entries: list[dict],
    weights: dict,
) -> Optional[str]:
    """Persist served recommendations; returns the log row id."""
    if supabase_client is None or not entries:
        return None
    try:
        resp = supabase_client.table("recommendation_logs").insert({
            "user_id": user_id,
            "session_id": session_id,
            "recommended_product_ids": [e["product_id"] for e in entries],
            "algorithm_weights": weights,
            "served_at": now_iso(),
        }).execute()
        if resp.data:
            return resp.data[0].get("id")
    except Exception as exc:
        logger.warning("Failed to log recommendations: %s", exc)
    return None


# ===========================================
# PYDANTIC MODELS
# ===========================================

class ClickEventIn(BaseModel):
    user_id: Optional[str] = None
    product_id: str
    variant_id: Optional[str] = None
    event_type: str = Field(pattern="^(view|click|add_to_cart|remove_from_cart|purchase|search_click|wishlist)$")
    session_id: Optional[str] = None


class SearchLogIn(BaseModel):
    user_id: Optional[str] = None
    query: str
    results_count: int = 0
    session_id: Optional[str] = None


class SessionIn(BaseModel):
    session_id: Optional[str] = None  # existing session UUID to close/update
    user_id: Optional[str] = None
    device_info: Optional[dict] = None
    end_session: bool = False


class FeedbackIn(BaseModel):
    recommendation_log_id: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    clicked_product_id: str


# ===========================================
# CORE ENDPOINTS
# ===========================================

@app.get("/")
def root():
    return {
        "message": "NovaCart Backend API",
        "status": "running",
        "database": "connected" if supabase_client else "not configured",
        "algorithms": ["knn", "svd", "fp_growth", "prefixspan", "hybrid"],
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "supabase": supabase_client is not None,
        "timestamp": now_iso(),
    }


# ===========================================
# RECOMMENDATION ENDPOINTS
# ===========================================

@app.get("/api/recommendations/user/{user_id}")
def user_recommendations(
    user_id: str,
    top_n: int = Query(10, ge=1, le=50),
    include_explanation: bool = True,
    session_id: Optional[str] = None,
):
    """Hybrid ensemble (KNN 0.25 + SVD 0.30 + FP-Growth 0.25 + PrefixSpan 0.20)."""
    require_db()
    try:
        entries = hybrid.recommend_for_user(
            user_id, top_n=top_n, session_id=session_id, include_breakdown=include_explanation
        )
        enriched = enrich_products(entries)
        log_id = log_recommendations(user_id, session_id, enriched, hybrid.weights)
        return {
            "method": "hybrid",
            "weights": hybrid.weights,
            "user_id": user_id,
            "recommendation_log_id": log_id,
            "count": len(enriched),
            "products": enriched,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("user_recommendations failed")
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/recommendations/product/{product_id}")
def product_recommendations(product_id: str, top_n: int = Query(6, ge=1, le=30)):
    """Item-based KNN + FP-Growth 'frequently bought together'."""
    require_db()
    try:
        entries = hybrid.recommend_for_product(product_id, top_n=top_n)
        enriched = enrich_products(entries)
        return {
            "method": "item_knn+fp_growth",
            "product_id": product_id,
            "count": len(enriched),
            "products": enriched,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("product_recommendations failed")
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/recommendations/session")
def session_recommendations(
    session_id: Optional[str] = None,
    current_product_ids: Optional[str] = None,
    top_n: int = Query(10, ge=1, le=50),
):
    """Session-based (PrefixSpan + FP-Growth) for anonymous visitors."""
    require_db()
    product_ids = [p.strip() for p in (current_product_ids or "").split(",") if p.strip()]
    if not session_id and not product_ids:
        raise HTTPException(status_code=422, detail="Provide session_id and/or current_product_ids")
    try:
        entries = hybrid.recommend_for_session(session_id, product_ids, top_n=top_n)
        enriched = enrich_products(entries)
        log_id = log_recommendations(None, session_id, enriched, {"prefixspan": 0.5, "fp_growth": 0.5})
        return {
            "method": "session:prefixspan+fp_growth",
            "session_id": session_id,
            "recommendation_log_id": log_id,
            "count": len(enriched),
            "products": enriched,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("session_recommendations failed")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/recommendations/feedback")
def recommendation_feedback(feedback: FeedbackIn):
    """Record which served recommendation was clicked."""
    require_db()
    try:
        if feedback.recommendation_log_id:
            row = (
                supabase_client.table("recommendation_logs")
                .select("clicked_items")
                .eq("id", feedback.recommendation_log_id)
                .limit(1)
                .execute()
            )
            clicked = (row.data[0].get("clicked_items") if row.data else None) or []
            if feedback.clicked_product_id not in clicked:
                clicked.append(feedback.clicked_product_id)
            supabase_client.table("recommendation_logs").update({
                "clicked_items": clicked,
                "clicked_at": now_iso(),
            }).eq("id", feedback.recommendation_log_id).execute()
        # also record as a behavioral click event for the recommenders
        _insert_with_fallback("click_events", {
            "user_id": feedback.user_id,
            "product_id": feedback.clicked_product_id,
            "event_type": "click",
            "session_id": feedback.session_id,
            "created_at": now_iso(),
        })
        return {"status": "recorded"}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("recommendation_feedback failed")
        raise HTTPException(status_code=500, detail=str(exc))


# ===========================================
# EVENT TRACKING ENDPOINTS
# ===========================================

def _insert_with_fallback(table: str, payload: dict[str, Any]) -> Any:
    """Fire-and-forget event insert.

    Uses returning='minimal' so RLS SELECT policies aren't required to read
    back the row (search_logs is admin-read-only). If migration 013 isn't
    applied yet (missing session_id column), retries without it."""
    try:
        return supabase_client.table(table).insert(payload, returning="minimal").execute()
    except Exception as exc:
        message = str(exc)
        if "session_id" in message and "session_id" in payload:
            trimmed = {k: v for k, v in payload.items() if k != "session_id"}
            return supabase_client.table(table).insert(trimmed, returning="minimal").execute()
        raise


@app.post("/api/events/click")
def track_click(event: ClickEventIn):
    require_db()
    try:
        _insert_with_fallback("click_events", {
            "user_id": event.user_id,
            "product_id": event.product_id,
            "variant_id": event.variant_id,
            "event_type": event.event_type,
            "session_id": event.session_id,
            "created_at": now_iso(),
        })
        return {"status": "logged"}
    except Exception as exc:
        logger.warning("track_click failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/events/search")
def track_search(log: SearchLogIn):
    require_db()
    try:
        _insert_with_fallback("search_logs", {
            "user_id": log.user_id,
            "query": log.query,
            "results_count": log.results_count,
            "session_id": log.session_id,
            "created_at": now_iso(),
        })
        return {"status": "logged"}
    except Exception as exc:
        logger.warning("track_search failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/events/session")
def track_session(payload: SessionIn):
    """Create a session, or close/attach a user to an existing one."""
    require_db()
    try:
        if payload.session_id:
            update: dict[str, Any] = {}
            if payload.end_session:
                update["session_end"] = now_iso()
            if payload.user_id:
                update["user_id"] = payload.user_id
            if payload.device_info:
                update["device_info"] = payload.device_info
            if update:
                supabase_client.table("user_sessions").update(update).eq(
                    "id", payload.session_id
                ).execute()
            return {"status": "updated", "session_id": payload.session_id}
        resp = supabase_client.table("user_sessions").insert({
            "user_id": payload.user_id,
            "session_start": now_iso(),
            "device_info": payload.device_info,
        }).execute()
        session_id = resp.data[0]["id"] if resp.data else None
        return {"status": "created", "session_id": session_id}
    except Exception as exc:
        logger.warning("track_session failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ===========================================
# EVALUATION ENDPOINT
# ===========================================

@app.get("/api/recommendations/evaluate")
def evaluate_recommendations(user_id: Optional[str] = None):
    """Offline evaluation on an 80/20 train/test split of the user-item matrix."""
    require_db()
    try:
        results = evaluator.evaluate(user_id=user_id)
        return {"evaluation": results, "weights": DEFAULT_WEIGHTS, "generated_at": now_iso()}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("evaluation failed")
        raise HTTPException(status_code=500, detail=str(exc))


# ===========================================
# ADMIN / MAINTENANCE
# ===========================================

@app.post("/api/recommendations/refresh")
def refresh_models():
    """Clear caches and re-mine patterns on next request."""
    require_db()
    data_loader.invalidate_cache()
    hybrid.fp_growth.refresh()
    hybrid.prefixspan.refresh()
    return {"status": "caches cleared"}


@app.get("/analytics/summary")
def analytics_summary():
    require_db()
    summary: dict[str, Any] = {
        "recommendation_methods": ["knn", "svd", "fp_growth", "prefixspan", "hybrid"],
        "weights": DEFAULT_WEIGHTS,
    }
    try:
        products = data_loader.fetch_products()
        summary["total_products"] = int(len(products))
        interactions = data_loader.fetch_user_item_matrix(None)
        summary["total_interactions"] = int(len(interactions))
        summary["unique_users"] = int(interactions["user_id"].nunique()) if not interactions.empty else 0
    except Exception as exc:
        summary["warning"] = str(exc)
    return summary


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
