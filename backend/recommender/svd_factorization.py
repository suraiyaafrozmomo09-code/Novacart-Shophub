"""SVD matrix factorization with sklearn TruncatedSVD.

Builds a sparse user-item matrix from explicit ratings + implicit signals
(purchase=5.0, add_to_cart=3.0, search_click=2.0, view=1.0), decomposes it
into latent factors (n_components=20) that capture patterns like brand
loyalty and budget sensitivity, and predicts unseen ratings via
user_vector @ item_vectors.T.

Cold-start users get a content-based/popularity fallback.
"""

from __future__ import annotations

import logging
from typing import Optional

import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.decomposition import TruncatedSVD

from recommender.data_loader import DataLoader

logger = logging.getLogger("novacart.recommender")

N_COMPONENTS = 20


class SVDRecommender:
    def __init__(self, loader: DataLoader, n_components: int = N_COMPONENTS):
        self.loader = loader
        self.n_components = n_components

    # ------------------------------------------------------------------
    def _decompose(self, pivot: pd.DataFrame):
        """Returns (user_factors, item_factors) or None if matrix too small."""
        n_components = min(self.n_components, min(pivot.shape) - 1)
        if n_components < 1:
            return None
        sparse = csr_matrix(pivot.values)
        svd = TruncatedSVD(n_components=n_components, random_state=42)
        user_factors = svd.fit_transform(sparse)          # (n_users, k)
        item_factors = svd.components_.T                  # (n_items, k)
        return user_factors, item_factors

    # ------------------------------------------------------------------
    def recommend_for_user(self, user_id: str, top_n: int = 10) -> dict[str, float]:
        """Predicted-rating scores for products the user hasn't interacted with."""
        pivot = self.loader.build_pivot_matrix()
        if pivot.empty or user_id not in pivot.index:
            return self._cold_start(user_id, top_n)

        decomposition = self._decompose(pivot)
        if decomposition is None:
            return self._cold_start(user_id, top_n)
        user_factors, item_factors = decomposition

        user_idx = pivot.index.get_loc(user_id)
        predicted = user_factors[user_idx] @ item_factors.T  # (n_items,)

        interacted = pivot.loc[user_id] > 0
        scores = {}
        for i, product_id in enumerate(pivot.columns):
            if interacted.iloc[i]:
                continue
            if predicted[i] > 0:
                scores[product_id] = float(predicted[i])

        if not scores:
            return self._cold_start(user_id, top_n)
        return dict(sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n])

    # ------------------------------------------------------------------
    def similar_items(self, product_id: str, top_n: int = 10) -> dict[str, float]:
        """Latent-space cosine similarity between items."""
        pivot = self.loader.build_pivot_matrix()
        if pivot.empty or product_id not in pivot.columns:
            return {}
        decomposition = self._decompose(pivot)
        if decomposition is None:
            return {}
        _, item_factors = decomposition

        idx = pivot.columns.get_loc(product_id)
        target = item_factors[idx]
        norms = np.linalg.norm(item_factors, axis=1) * (np.linalg.norm(target) or 1.0)
        norms[norms == 0] = 1.0
        similarities = (item_factors @ target) / norms

        scores = {}
        for i, pid in enumerate(pivot.columns):
            if pid == product_id:
                continue
            if similarities[i] > 0:
                scores[pid] = float(similarities[i])
        return dict(sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n])

    # ------------------------------------------------------------------
    def predict_matrix(self, pivot: pd.DataFrame) -> Optional[pd.DataFrame]:
        """Full predicted-rating matrix (used by offline evaluation)."""
        decomposition = self._decompose(pivot)
        if decomposition is None:
            return None
        user_factors, item_factors = decomposition
        predictions = user_factors @ item_factors.T
        return pd.DataFrame(predictions, index=pivot.index, columns=pivot.columns)

    # ------------------------------------------------------------------
    def _cold_start(self, user_id: Optional[str], top_n: int) -> dict[str, float]:
        """Content-based fallback via category preference, else popularity."""
        category_id = self.loader.most_viewed_category(user_id) if user_id else None
        top = self.loader.top_rated_products(top_n, category_id)
        return {pid: float(top_n - i) for i, pid in enumerate(top)}
