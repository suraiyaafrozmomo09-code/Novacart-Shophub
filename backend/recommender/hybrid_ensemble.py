"""Hybrid weighted ensemble combiner.

Per-algorithm raw scores are min-max normalized to [0,1], then combined:
    final(product) = Σ weight_i × normalized_score_i(product)

Default weights (from proposal): KNN 0.25, SVD 0.30, FP-Growth 0.25,
PrefixSpan 0.20 — configurable per call.

Post-processing:
- Novelty boost: score × 1/(1 + log(1 + popularity_percentile)), percentile 0-100
- Diversity injection: re-rank so the top-10 spans >= 3 categories
- Cold-start: new users -> popularity + content-based; handled inside the
  individual recommenders' fallbacks.
"""

from __future__ import annotations

import logging
import math
from typing import Iterable, Optional

import pandas as pd

from recommender.data_loader import DataLoader
from recommender.fp_growth_association import FPGrowthRecommender
from recommender.knn_collaborative import KNNCollaborativeRecommender
from recommender.prefixspan_sequential import PrefixSpanRecommender
from recommender.svd_factorization import SVDRecommender

logger = logging.getLogger("novacart.recommender")

DEFAULT_WEIGHTS = {
    "knn": 0.25,
    "svd": 0.30,
    "fp_growth": 0.25,
    "prefixspan": 0.20,
}

MIN_CATEGORIES_IN_TOP = 3
DIVERSITY_WINDOW = 10


def normalize_scores(scores: dict[str, float]) -> dict[str, float]:
    """Min-max scale to [0,1] per algorithm call."""
    if not scores:
        return {}
    values = list(scores.values())
    lo, hi = min(values), max(values)
    if hi == lo:
        return {k: 1.0 for k in scores}
    return {k: (v - lo) / (hi - lo) for k, v in scores.items()}


class HybridRecommender:
    def __init__(self, loader: DataLoader, weights: Optional[dict[str, float]] = None):
        self.loader = loader
        self.weights = {**DEFAULT_WEIGHTS, **(weights or {})}
        self.knn = KNNCollaborativeRecommender(loader)
        self.svd = SVDRecommender(loader)
        self.fp_growth = FPGrowthRecommender(loader)
        self.prefixspan = PrefixSpanRecommender(loader)

    # ------------------------------------------------------------------
    def recommend_for_user(
        self,
        user_id: str,
        top_n: int = 10,
        session_id: Optional[str] = None,
        include_breakdown: bool = True,
    ) -> list[dict]:
        """Full ensemble for a known user. Returns ranked entries with
        per-algorithm normalized scores for explanations."""
        candidate_pool = max(top_n * 3, 30)

        knn_scores = normalize_scores(self.knn.recommend_for_user(user_id, candidate_pool))
        svd_scores = normalize_scores(self.svd.recommend_for_user(user_id, candidate_pool))

        # FP-Growth seeded by the user's purchase/cart history
        user_items = self._user_history(user_id)
        fp_scores = normalize_scores(
            self.fp_growth.recommend_for_basket(user_items, candidate_pool) if user_items else {}
        )

        # PrefixSpan from the active session (or the user's recent behavior)
        if session_id:
            seq_scores = self.prefixspan.recommend_for_session(session_id, candidate_pool)
        else:
            seq_scores = self.prefixspan.predict_next(user_items[-5:], candidate_pool) if user_items else {}
        seq_scores = normalize_scores(seq_scores)

        per_algorithm = {
            "knn": knn_scores,
            "svd": svd_scores,
            "fp_growth": fp_scores,
            "prefixspan": seq_scores,
        }
        return self._combine(per_algorithm, top_n, exclude=set(user_items), include_breakdown=include_breakdown)

    # ------------------------------------------------------------------
    def recommend_for_session(
        self,
        session_id: Optional[str],
        current_product_ids: Iterable[str],
        top_n: int = 10,
    ) -> list[dict]:
        """Anonymous/session-based: PrefixSpan + FP-Growth only,
        re-weighted proportionally."""
        current = [p for p in current_product_ids if p]
        candidate_pool = max(top_n * 3, 30)

        seq_scores: dict[str, float] = {}
        if session_id:
            seq_scores = self.prefixspan.recommend_for_session(session_id, candidate_pool)
        if not seq_scores and current:
            seq_scores = self.prefixspan.predict_next(current, candidate_pool)
        fp_scores = self.fp_growth.recommend_for_basket(current, candidate_pool) if current else {}

        per_algorithm = {
            "prefixspan": normalize_scores(seq_scores),
            "fp_growth": normalize_scores(fp_scores),
        }
        results = self._combine(per_algorithm, top_n, exclude=set(current), include_breakdown=True)
        if results:
            return results
        # cold session: popularity fallback
        top = self.loader.top_rated_products(top_n)
        return [
            {"product_id": pid, "score": (top_n - i) / top_n, "breakdown": {}, "reason": "Popular right now"}
            for i, pid in enumerate(top)
            if pid not in set(current)
        ]

    # ------------------------------------------------------------------
    def recommend_for_product(self, product_id: str, top_n: int = 6) -> list[dict]:
        """Product-page recs: item-based KNN + frequently-bought-together."""
        candidate_pool = max(top_n * 3, 18)
        knn_scores = normalize_scores(self.knn.similar_items(product_id, candidate_pool))
        fp_scores = normalize_scores(self.fp_growth.frequently_bought_together(product_id, candidate_pool))
        per_algorithm = {"knn": knn_scores, "fp_growth": fp_scores}
        results = self._combine(per_algorithm, top_n, exclude={product_id}, include_breakdown=True)
        if results:
            return results
        fallback = self.knn._content_similar(product_id, top_n)
        norm = normalize_scores(fallback)
        return [
            {"product_id": pid, "score": s, "breakdown": {"content": s}, "reason": "Similar product"}
            for pid, s in sorted(norm.items(), key=lambda x: x[1], reverse=True)
        ]

    # ------------------------------------------------------------------
    def _combine(
        self,
        per_algorithm: dict[str, dict[str, float]],
        top_n: int,
        exclude: Optional[set[str]] = None,
        include_breakdown: bool = True,
    ) -> list[dict]:
        exclude = exclude or set()
        active = {name: scores for name, scores in per_algorithm.items() if scores}
        if not active:
            return []

        # re-normalize weights over algorithms that produced scores
        total_weight = sum(self.weights.get(name, 0.0) for name in active) or 1.0

        combined: dict[str, dict] = {}
        for name, scores in active.items():
            weight = self.weights.get(name, 0.0) / total_weight
            for product_id, score in scores.items():
                if product_id in exclude:
                    continue
                entry = combined.setdefault(product_id, {"score": 0.0, "breakdown": {}})
                entry["score"] += weight * score
                entry["breakdown"][name] = round(score, 4)

        # novelty boost
        popularity = self._popularity_percentiles()
        for product_id, entry in combined.items():
            percentile = popularity.get(product_id, 50.0)
            entry["score"] *= 1.0 / (1.0 + math.log(1.0 + percentile))
            entry["popularity_percentile"] = round(percentile, 1)

        ranked = sorted(combined.items(), key=lambda x: x[1]["score"], reverse=True)
        ranked = self._inject_diversity(ranked, top_n)

        results = []
        for product_id, entry in ranked[:top_n]:
            item = {
                "product_id": product_id,
                "score": round(entry["score"], 4),
                "reason": self._explain(entry["breakdown"]),
            }
            if include_breakdown:
                item["breakdown"] = entry["breakdown"]
            results.append(item)
        return results

    # ------------------------------------------------------------------
    def _inject_diversity(self, ranked: list[tuple[str, dict]], top_n: int) -> list[tuple[str, dict]]:
        """Ensure the top window spans >= 3 categories by promoting the
        best-scored items from unrepresented categories."""
        window = min(DIVERSITY_WINDOW, top_n)
        if len(ranked) <= window:
            return ranked
        products = self.loader.fetch_products()
        if products.empty or "category_id" not in products.columns:
            return ranked
        cat_map = dict(zip(products["id"], products["category_id"]))

        top = ranked[:window]
        rest = ranked[window:]
        categories = {cat_map.get(pid) for pid, _ in top} - {None}
        if len(categories) >= MIN_CATEGORIES_IN_TOP:
            return ranked

        for i, (pid, entry) in enumerate(rest):
            cat = cat_map.get(pid)
            if cat is None or cat in categories:
                continue
            # swap out the lowest-scored top item whose category is duplicated
            duplicated = [
                j for j in range(len(top) - 1, -1, -1)
                if sum(1 for p, _ in top if cat_map.get(p) == cat_map.get(top[j][0])) > 1
            ]
            if not duplicated:
                break
            swap_idx = duplicated[0]
            top[swap_idx], rest[i] = rest[i], top[swap_idx]
            categories = {cat_map.get(p) for p, _ in top} - {None}
            if len(categories) >= MIN_CATEGORIES_IN_TOP:
                break
        return top + rest

    # ------------------------------------------------------------------
    def _popularity_percentiles(self) -> dict[str, float]:
        counts = self.loader.product_popularity()
        if counts.empty:
            return {}
        percentiles = counts.rank(pct=True) * 100.0
        return percentiles.to_dict()

    # ------------------------------------------------------------------
    def _user_history(self, user_id: str) -> list[str]:
        matrix = self.loader.fetch_user_item_matrix(user_id)
        if matrix.empty:
            return []
        return (
            matrix.sort_values("rating", ascending=False)["product_id"].tolist()
        )

    # ------------------------------------------------------------------
    @staticmethod
    def _explain(breakdown: dict[str, float]) -> str:
        if not breakdown:
            return "Recommended for you"
        dominant = max(breakdown.items(), key=lambda x: x[1])[0]
        reasons = {
            "knn": "Customers with similar taste also liked this",
            "svd": "Matches your shopping preferences",
            "fp_growth": "Frequently bought together with items you like",
            "prefixspan": "Based on your recent browsing pattern",
            "content": "Similar to products you viewed",
        }
        return reasons.get(dominant, "Recommended for you")
