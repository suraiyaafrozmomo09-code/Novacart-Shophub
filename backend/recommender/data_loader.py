"""Data access layer: fetches interaction data from Supabase and builds
pandas user-item matrices for the recommendation algorithms.

All fetches degrade gracefully: if a table/function is missing or the network
is down, empty DataFrames are returned so the API can still respond with
popularity/content-based fallbacks.
"""

from __future__ import annotations

import logging
import time
from typing import Any, Optional

import pandas as pd

logger = logging.getLogger("novacart.recommender")

# Implicit feedback weights (from proposal)
EVENT_WEIGHTS = {
    "purchase": 5.0,
    "add_to_cart": 3.0,
    "search_click": 2.0,
    "view": 1.0,
    "click": 1.0,
    "wishlist": 2.5,
}

_CACHE_TTL_SECONDS = 120


class DataLoader:
    """Fetches and caches recommendation source data from Supabase."""

    def __init__(self, supabase_client: Any):
        self.client = supabase_client
        self._cache: dict[str, tuple[float, Any]] = {}

    # ------------------------------------------------------------------
    # caching helpers
    # ------------------------------------------------------------------
    def _cached(self, key: str) -> Optional[Any]:
        entry = self._cache.get(key)
        if entry and (time.time() - entry[0]) < _CACHE_TTL_SECONDS:
            return entry[1]
        return None

    def _store(self, key: str, value: Any) -> Any:
        self._cache[key] = (time.time(), value)
        return value

    def invalidate_cache(self) -> None:
        self._cache.clear()

    # ------------------------------------------------------------------
    # raw fetches
    # ------------------------------------------------------------------
    def fetch_products(self) -> pd.DataFrame:
        cached = self._cached("products")
        if cached is not None:
            return cached
        try:
            resp = (
                self.client.table("products")
                .select("id, name, brand, category_id, product_type, sub_type, gender, average_rating, review_count, status, category:categories(id, name, slug)")
                .eq("status", "active")
                .execute()
            )
            rows = resp.data or []
            for row in rows:
                cat = row.pop("category", None) or {}
                row["category_name"] = cat.get("name")
                row["category_slug"] = cat.get("slug")
            df = pd.DataFrame(rows)
        except Exception as exc:  # pragma: no cover - network failure path
            logger.warning("fetch_products failed: %s", exc)
            df = pd.DataFrame()
        return self._store("products", df)

    def fetch_variants(self) -> pd.DataFrame:
        cached = self._cached("variants")
        if cached is not None:
            return cached
        try:
            resp = (
                self.client.table("product_variants")
                .select("id, product_id, price, quantity, image")
                .execute()
            )
            df = pd.DataFrame(resp.data or [])
        except Exception as exc:  # pragma: no cover
            logger.warning("fetch_variants failed: %s", exc)
            df = pd.DataFrame()
        return self._store("variants", df)

    def fetch_user_item_matrix(self, user_id: Optional[str] = None) -> pd.DataFrame:
        """Long-format (user_id, product_id, rating) via the SQL function,
        falling back to a client-side join if the RPC is unavailable."""
        cache_key = f"uim:{user_id or 'all'}"
        cached = self._cached(cache_key)
        if cached is not None:
            return cached
        try:
            resp = self.client.rpc(
                "get_user_item_matrix", {"p_user_id": user_id}
            ).execute()
            df = pd.DataFrame(resp.data or [])
        except Exception as exc:
            logger.warning("get_user_item_matrix RPC failed (%s); building client-side", exc)
            df = self._build_matrix_client_side(user_id)
        if not df.empty:
            df = df.dropna(subset=["user_id", "product_id"])
            df["rating"] = pd.to_numeric(df["rating"], errors="coerce").fillna(1.0)
        return self._store(cache_key, df)

    def _build_matrix_client_side(self, user_id: Optional[str] = None) -> pd.DataFrame:
        """Fallback: combine explicit ratings, orders, and click events in pandas."""
        frames = []
        # explicit ratings
        try:
            q = self.client.table("user_ratings_explicit").select("user_id, product_id, rating")
            if user_id:
                q = q.eq("user_id", user_id)
            frames.append(pd.DataFrame(q.execute().data or []))
        except Exception:
            pass
        # purchases
        try:
            resp = (
                self.client.table("order_items")
                .select("product_id, order:orders(user_id, status)")
                .execute()
            )
            rows = []
            for item in resp.data or []:
                order = item.get("order") or {}
                if order.get("status") == "cancelled":
                    continue
                if order.get("user_id"):
                    rows.append({
                        "user_id": order["user_id"],
                        "product_id": item["product_id"],
                        "rating": EVENT_WEIGHTS["purchase"],
                    })
            frames.append(pd.DataFrame(rows))
        except Exception:
            pass
        # behavioral events
        try:
            q = (
                self.client.table("click_events")
                .select("user_id, product_id, event_type")
                .not_.is_("user_id", "null")
                .limit(20000)
            )
            if user_id:
                q = q.eq("user_id", user_id)
            events = pd.DataFrame(q.execute().data or [])
            if not events.empty:
                events["rating"] = events["event_type"].map(EVENT_WEIGHTS).fillna(1.0)
                frames.append(events[["user_id", "product_id", "rating"]])
        except Exception:
            pass

        frames = [f for f in frames if not f.empty]
        if not frames:
            return pd.DataFrame(columns=["user_id", "product_id", "rating"])
        combined = pd.concat(frames, ignore_index=True)
        # strongest signal wins per (user, product); explicit rating rows already carry their value
        matrix = (
            combined.groupby(["user_id", "product_id"], as_index=False)["rating"].max()
        )
        matrix["rating"] = matrix["rating"].clip(upper=5.0)
        if user_id:
            matrix = matrix[matrix["user_id"] == user_id]
        return matrix

    def fetch_transactions(self) -> pd.DataFrame:
        """Order-level transactions for FP-Growth: (order_id, product_id)."""
        cached = self._cached("transactions")
        if cached is not None:
            return cached
        try:
            resp = (
                self.client.table("order_items")
                .select("order_id, product_id, order:orders(status)")
                .execute()
            )
            rows = [
                {"order_id": r["order_id"], "product_id": r["product_id"]}
                for r in (resp.data or [])
                if (r.get("order") or {}).get("status") != "cancelled"
            ]
            df = pd.DataFrame(rows)
        except Exception as exc:  # pragma: no cover
            logger.warning("fetch_transactions failed: %s", exc)
            df = pd.DataFrame()
        return self._store("transactions", df)

    def fetch_behavior_sequences(
        self, user_id: Optional[str] = None, session_limit: int = 50
    ) -> pd.DataFrame:
        """Per-session ordered action sequences for PrefixSpan."""
        cache_key = f"seq:{user_id or 'all'}:{session_limit}"
        cached = self._cached(cache_key)
        if cached is not None:
            return cached
        try:
            resp = self.client.rpc(
                "get_user_behavior_sequences",
                {"p_user_id": user_id, "session_limit": session_limit},
            ).execute()
            df = pd.DataFrame(resp.data or [])
        except Exception as exc:
            logger.warning("get_user_behavior_sequences RPC failed (%s); querying directly", exc)
            try:
                q = (
                    self.client.table("click_events")
                    .select("session_id, user_id, product_id, event_type, created_at")
                    .not_.is_("session_id", "null")
                    .order("created_at")
                    .limit(10000)
                )
                if user_id:
                    q = q.eq("user_id", user_id)
                df = pd.DataFrame(q.execute().data or [])
            except Exception:
                df = pd.DataFrame()
        return self._store(cache_key, df)

    def fetch_session_events(self, session_id: str) -> pd.DataFrame:
        """Ordered events for one live session (not cached: it changes fast)."""
        try:
            resp = (
                self.client.table("click_events")
                .select("product_id, event_type, created_at")
                .eq("session_id", session_id)
                .order("created_at")
                .limit(200)
                .execute()
            )
            return pd.DataFrame(resp.data or [])
        except Exception as exc:  # pragma: no cover
            logger.warning("fetch_session_events failed: %s", exc)
            return pd.DataFrame()

    # ------------------------------------------------------------------
    # derived structures
    # ------------------------------------------------------------------
    def build_pivot_matrix(self, user_id: Optional[str] = None) -> pd.DataFrame:
        """Wide user × product rating matrix (rows: users, cols: products)."""
        long_df = self.fetch_user_item_matrix(None)  # need ALL users for CF
        if long_df.empty:
            return pd.DataFrame()
        return long_df.pivot_table(
            index="user_id", columns="product_id", values="rating", aggfunc="max"
        ).fillna(0.0)

    def product_popularity(self) -> pd.Series:
        """Interaction counts per product (for popularity fallback + novelty)."""
        long_df = self.fetch_user_item_matrix(None)
        if long_df.empty:
            products = self.fetch_products()
            if products.empty:
                return pd.Series(dtype=float)
            return products.set_index("id")["review_count"].fillna(0).astype(float)
        return long_df.groupby("product_id")["rating"].count().astype(float)

    def top_rated_products(self, top_n: int = 10, category_id: Optional[str] = None) -> list[str]:
        products = self.fetch_products()
        if products.empty:
            return []
        df = products.copy()
        if category_id is not None and "category_id" in df.columns:
            in_cat = df[df["category_id"] == category_id]
            if not in_cat.empty:
                df = in_cat
        df["average_rating"] = pd.to_numeric(df.get("average_rating"), errors="coerce").fillna(0)
        df["review_count"] = pd.to_numeric(df.get("review_count"), errors="coerce").fillna(0)
        df = df.sort_values(["average_rating", "review_count"], ascending=False)
        return df["id"].head(top_n).tolist()

    def most_viewed_category(self, user_id: str) -> Optional[str]:
        """The category the user has interacted with most (for cold-start)."""
        try:
            resp = (
                self.client.table("click_events")
                .select("product_id")
                .eq("user_id", user_id)
                .limit(500)
                .execute()
            )
            events = pd.DataFrame(resp.data or [])
        except Exception:
            events = pd.DataFrame()
        if events.empty:
            return None
        products = self.fetch_products()
        if products.empty or "category_id" not in products.columns:
            return None
        merged = events.merge(products[["id", "category_id"]], left_on="product_id", right_on="id")
        if merged.empty:
            return None
        return merged["category_id"].mode().iloc[0]
