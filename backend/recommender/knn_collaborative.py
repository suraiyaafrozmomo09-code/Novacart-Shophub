"""KNN collaborative filtering using sklearn NearestNeighbors (cosine).

Two modes:
- user-based: find K nearest users by rating vector, aggregate their items
- item-based: find K most similar items by rating-pattern cosine similarity

Cold-start: users with no ratings fall back to top-rated products in their
most-viewed category (or global top-rated).
"""

from __future__ import annotations

import logging
from typing import Optional

import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.neighbors import NearestNeighbors

from recommender.data_loader import DataLoader

logger = logging.getLogger("novacart.recommender")

N_NEIGHBORS = 20
METRIC = "cosine"


class KNNCollaborativeRecommender:
    def __init__(self, loader: DataLoader, n_neighbors: int = N_NEIGHBORS):
        self.loader = loader
        self.n_neighbors = n_neighbors

    # ------------------------------------------------------------------
    def _fit(self, matrix: np.ndarray) -> NearestNeighbors:
        n_neighbors = min(self.n_neighbors, matrix.shape[0])
        model = NearestNeighbors(n_neighbors=n_neighbors, metric=METRIC, algorithm="brute")
        model.fit(csr_matrix(matrix))
        return model

    # ------------------------------------------------------------------
    def recommend_for_user(self, user_id: str, top_n: int = 10) -> dict[str, float]:
        """User-based CF. Returns {product_id: raw_score}."""
        pivot = self.loader.build_pivot_matrix()
        if pivot.empty or user_id not in pivot.index or pivot.shape[0] < 2:
            return self._cold_start(user_id, top_n)

        user_vector = pivot.loc[[user_id]].values
        model = self._fit(pivot.values)
        distances, indices = model.kneighbors(user_vector)

        scores: dict[str, float] = {}
        already_rated = set(pivot.columns[pivot.loc[user_id] > 0])
        for dist, idx in zip(distances[0], indices[0]):
            neighbor_id = pivot.index[idx]
            if neighbor_id == user_id:
                continue
            similarity = 1.0 - dist  # cosine distance -> similarity
            if similarity <= 0:
                continue
            neighbor_ratings = pivot.iloc[idx]
            for product_id, rating in neighbor_ratings[neighbor_ratings > 0].items():
                if product_id in already_rated:
                    continue
                scores[product_id] = scores.get(product_id, 0.0) + similarity * float(rating)

        if not scores:
            return self._cold_start(user_id, top_n)
        ranked = dict(sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n])
        return ranked

    # ------------------------------------------------------------------
    def similar_items(self, product_id: str, top_n: int = 10) -> dict[str, float]:
        """Item-based CF: cosine similarity between item rating columns."""
        pivot = self.loader.build_pivot_matrix()
        if pivot.empty or product_id not in pivot.columns or pivot.shape[1] < 2:
            return self._content_similar(product_id, top_n)

        item_matrix = pivot.T  # rows: products, cols: users
        model = self._fit(item_matrix.values)
        target = item_matrix.loc[[product_id]].values
        distances, indices = model.kneighbors(target)

        scores: dict[str, float] = {}
        for dist, idx in zip(distances[0], indices[0]):
            candidate = item_matrix.index[idx]
            if candidate == product_id:
                continue
            similarity = 1.0 - dist
            if similarity > 0:
                scores[candidate] = float(similarity)

        if not scores:
            return self._content_similar(product_id, top_n)
        return dict(sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n])

    # ------------------------------------------------------------------
    # fallbacks
    # ------------------------------------------------------------------
    def _cold_start(self, user_id: Optional[str], top_n: int) -> dict[str, float]:
        """Popularity fallback: top-rated items in the user's most-viewed category."""
        category_id = self.loader.most_viewed_category(user_id) if user_id else None
        top = self.loader.top_rated_products(top_n, category_id)
        # descending pseudo-scores so downstream normalization keeps the order
        return {pid: float(top_n - i) for i, pid in enumerate(top)}

    def _content_similar(self, product_id: str, top_n: int) -> dict[str, float]:
        """Content-based fallback for items with no rating overlap."""
        products = self.loader.fetch_products()
        if products.empty:
            return {}
        target = products[products["id"] == product_id]
        if target.empty:
            return {}
        target = target.iloc[0]

        def score(row: pd.Series) -> float:
            s = 0.0
            if row.get("category_id") == target.get("category_id"):
                s += 3.0
            if row.get("product_type") == target.get("product_type"):
                s += 2.0
            if row.get("sub_type") and row.get("sub_type") == target.get("sub_type"):
                s += 2.0
            if row.get("brand") and row.get("brand") == target.get("brand"):
                s += 1.5
            if row.get("gender") in (target.get("gender"), "unisex"):
                s += 1.0
            s += float(row.get("average_rating") or 0) * 0.5
            return s

        candidates = products[products["id"] != product_id]
        scored = {row["id"]: score(row) for _, row in candidates.iterrows()}
        scored = {k: v for k, v in scored.items() if v > 0}
        return dict(sorted(scored.items(), key=lambda x: x[1], reverse=True)[:top_n])
