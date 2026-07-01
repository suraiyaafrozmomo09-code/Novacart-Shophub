from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import json

app = FastAPI(title="ShopHub Backend API", description="Recommendation Engine & Analytics")

# ===========================================
# PYDANTIC MODELS
# ===========================================

class Product(BaseModel):
    id: str
    name: str
    category: str
    product_type: str
    sub_type: Optional[str] = None
    gender: str
    price: float
    rating: float

class SearchLog(BaseModel):
    user_id: Optional[str] = None
    query: str
    results_count: int
    timestamp: str

class ClickEvent(BaseModel):
    user_id: Optional[str] = None
    product_id: str
    variant_id: Optional[str] = None
    event_type: str
    timestamp: str

class RecommendationRequest(BaseModel):
    user_id: Optional[str] = None
    product_id: Optional[str] = None
    method: str = "hybrid"
    top_n: int = 10

# ===========================================
# DUMMY DATA (Replace with Supabase)
# ===========================================

SAMPLE_PRODUCTS = [
    {"id": "p1", "name": "Cotton Baby Romper", "category": "Baby Clothes", "product_type": "clothing", "sub_type": "romper", "gender": "unisex", "price": 25.99, "rating": 4.5},
    {"id": "p2", "name": "Men's Formal Shirt", "category": "Men's Clothing", "product_type": "clothing", "sub_type": "shirt", "gender": "male", "price": 45.99, "rating": 4.2},
    {"id": "p3", "name": "Women's Kurti", "category": "Women's Clothing", "product_type": "clothing", "sub_type": "kurti", "gender": "female", "price": 35.99, "rating": 4.7},
    {"id": "p4", "name": "Men's Leather Loafer", "category": "Men's Shoes", "product_type": "shoes", "sub_type": "loafer", "gender": "male", "price": 89.99, "rating": 4.4},
    {"id": "p5", "name": "Women's High Heel", "category": "Women's Shoes", "product_type": "shoes", "sub_type": "heel", "gender": "female", "price": 65.99, "rating": 4.3},
    {"id": "p6", "name": "Smartphone Samsung S24", "category": "Electronics", "product_type": "electronics", "sub_type": "phone", "gender": "unisex", "price": 999.99, "rating": 4.8},
    {"id": "p7", "name": "Wireless Headphones", "category": "Electronics", "product_type": "electronics", "sub_type": "headphones", "gender": "unisex", "price": 149.99, "rating": 4.6},
    {"id": "p8", "name": "Men's Watch", "category": "Accessories", "product_type": "accessories", "sub_type": "watch", "gender": "male", "price": 199.99, "rating": 4.5},
    {"id": "p9", "name": "Women's Perfume", "category": "Accessories", "product_type": "accessories", "sub_type": "perfume", "gender": "female", "price": 55.99, "rating": 4.4},
    {"id": "p10", "name": "Power Bank 20000mAh", "category": "Electronics", "product_type": "electronics", "sub_type": "powerbank", "gender": "unisex", "price": 39.99, "rating": 4.3},
]

SEARCH_HISTORY = [
    {"query": "iPhone 15", "results": 12},
    {"query": "men t-shirt", "results": 45},
    {"query": "wireless earbuds", "results": 23},
]

CLICK_HISTORY = [
    {"product_id": "p6", "event_type": "view"},
    {"product_id": "p7", "event_type": "click"},
]

# ===========================================
# CONTENT-BASED FILTERING
# ===========================================

def content_based_recommendations(product_id: str, top_n: int = 10) -> List[dict]:
    target = next((p for p in SAMPLE_PRODUCTS if p["id"] == product_id), None)
    if not target:
        return SAMPLE_PRODUCTS[:top_n]

    def similarity_score(p: dict) -> float:
        score = 0.0
        if p["category"] == target["category"]:
            score += 3.0
        if p["product_type"] == target["product_type"]:
            score += 2.0
        if p["gender"] == target["gender"] or p["gender"] == "unisex" or target["gender"] == "unisex":
            score += 1.0
        score += p["rating"] * 0.5
        return score

    scored = [(p, similarity_score(p)) for p in SAMPLE_PRODUCTS if p["id"] != product_id]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [p for p, s in scored[:top_n]]

# ===========================================
# COLLABORATIVE FILTERING (User-Based)
# ===========================================

def collaborative_filtering(user_id: Optional[str], top_n: int = 10) -> List[dict]:
    # In production, replace with actual user-item matrix from Supabase
    # Simulating similar user behavior
    user_preferences = {
        "u1": ["p6", "p7", "p10"],
        "u2": ["p2", "p4", "p8"],
        "u3": ["p3", "p5", "p9"],
    }

    similar_user_items = set()
    if user_id and user_id in user_preferences:
        for other_user, items in user_preferences.items():
            if other_user != user_id:
                similar_user_items.update(items)

    return [p for p in SAMPLE_PRODUCTS if p["id"] in similar_user_items][:top_n]

# ===========================================
# HYBRID RECOMMENDATION
# ===========================================

def hybrid_recommendations(user_id: Optional[str], product_id: Optional[str], top_n: int = 10) -> List[dict]:
    content_recs = content_based_recommendations(product_id or "p1", top_n * 2) if product_id else []
    collab_recs = collaborative_filtering(user_id, top_n * 2)

    scores = {}
    for p in content_recs:
        scores[p["id"]] = scores.get(p["id"], 0) + 0.6
    for p in collab_recs:
        scores[p["id"]] = scores.get(p["id"], 0) + 0.4

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [next(p for p in SAMPLE_PRODUCTS if p["id"] == pid) for pid, _ in ranked[:top_n]]

# ===========================================
# API ENDPOINTS
# ===========================================

@app.get("/")
def root():
    return {"message": "ShopHub Backend API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/recommendations")
def get_recommendations(user_id: Optional[str] = None, product_id: Optional[str] = None, method: str = "hybrid", top_n: int = 10):
    if method == "content":
        return {"method": "content-based", "products": content_based_recommendations(product_id or "p1", top_n)}
    elif method == "collaborative":
        return {"method": "collaborative", "products": collaborative_filtering(user_id, top_n)}
    else:
        return {"method": "hybrid", "products": hybrid_recommendations(user_id, product_id, top_n)}

@app.get("/recommendations/similar/{product_id}")
def similar_products(product_id: str, top_n: int = 5):
    return {"method": "content-based", "products": content_based_recommendations(product_id, top_n)}

@app.get("/recommendations/user/{user_id}")
def user_recommendations(user_id: str, top_n: int = 10):
    return {"method": "collaborative", "products": collaborative_filtering(user_id, top_n)}

@app.get("/search-logs")
def get_search_logs(limit: int = 100):
    return {"logs": SEARCH_HISTORY[:limit], "total": len(SEARCH_HISTORY)}

@app.post("/search-logs")
def log_search(log: SearchLog):
    SEARCH_HISTORY.append({"query": log.query, "results": log.results_count, "user_id": log.user_id, "timestamp": log.timestamp})
    return {"status": "logged"}

@app.get("/click-events")
def get_click_events(product_id: Optional[str] = None, limit: int = 100):
    events = CLICK_HISTORY
    if product_id:
        events = [e for e in events if e["product_id"] == product_id]
    return {"events": events[:limit], "total": len(events)}

@app.post("/click-events")
def log_click_event(event: ClickEvent):
    CLICK_HISTORY.append({
        "product_id": event.product_id,
        "event_type": event.event_type,
        "user_id": event.user_id,
        "timestamp": event.timestamp
    })
    return {"status": "logged"}

@app.get("/analytics/summary")
def analytics_summary():
    return {
        "total_products": len(SAMPLE_PRODUCTS),
        "recommendation_methods": ["content-based", "collaborative", "hybrid"],
        "total_searches": len(SEARCH_HISTORY),
        "total_clicks": len(CLICK_HISTORY),
        "categories": list({p["category"] for p in SAMPLE_PRODUCTS})
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
