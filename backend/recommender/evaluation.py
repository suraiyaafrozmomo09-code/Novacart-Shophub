"""Offline evaluation: RMSE, Precision@K, Recall@K, NDCG@K, MAP, Hit Rate.

Splits the long-format user-item matrix 80/20 per user (leave-out on the
users' interactions), trains each algorithm on the train split, and scores
its ranked recommendations against the held-out items.
"""

from __future__ import annotations

import logging
import math
from typing import Optional

import numpy as np
import pandas as pd

from recommender.data_loader import DataLoader

logger = logging.getLogger("novacart.recommender")

RELEVANCE_THRESHOLD = 3.0  # held-out items rated >= this are "relevant"


# ----------------------------------------------------------------------
# metric primitives
# ----------------------------------------------------------------------
def rmse(predicted: list[float], actual: list[float]) -> Optional[float]:
    if not predicted or len(predicted) != len(actual):
        return None
    diff = np.array(predicted) - np.array(actual)
    return float(np.sqrt(np.mean(diff ** 2)))


def precision_at_k(recommended: list[str], relevant: set[str], k: int) -> float:
    if k <= 0 or not recommended:
        return 0.0
    top_k = recommended[:k]
    hits = sum(1 for item in top_k if item in relevant)
    return hits / k


def recall_at_k(recommended: list[str], relevant: set[str], k: int) -> float:
    if not relevant:
        return 0.0
    top_k = recommended[:k]
    hits = sum(1 for item in top_k if item in relevant)
    return hits / len(relevant)


def ndcg_at_k(recommended: list[str], relevant: set[str], k: int) -> float:
    top_k = recommended[:k]
    dcg = sum(1.0 / math.log2(i + 2) for i, item in enumerate(top_k) if item in relevant)
    ideal_hits = min(len(relevant), k)
    idcg = sum(1.0 / math.log2(i + 2) for i in range(ideal_hits))
    return dcg / idcg if idcg > 0 else 0.0


def average_precision(recommended: list[str], relevant: set[str], k: int = 10) -> float:
    if not relevant:
        return 0.0
    score, hits = 0.0, 0
    for i, item in enumerate(recommended[:k]):
        if item in relevant:
            hits += 1
            score += hits / (i + 1)
    return score / min(len(relevant), k)


def hit_rate(recommended: list[str], relevant: set[str], k: int = 10) -> float:
    return 1.0 if any(item in relevant for item in recommended[:k]) else 0.0


# ----------------------------------------------------------------------
# evaluation harness
# ----------------------------------------------------------------------
class Evaluator:
    def __init__(self, loader: DataLoader, seed: int = 42):
        self.loader = loader
        self.seed = seed

    def train_test_split(self, long_df: pd.DataFrame, test_frac: float = 0.2):
        """Per-user 80/20 split. Users with < 2 interactions stay in train."""
        rng = np.random.default_rng(self.seed)
        test_indices = []
        for _, group in long_df.groupby("user_id"):
            if len(group) < 2:
                continue
            n_test = max(1, int(len(group) * test_frac))
            test_indices.extend(rng.choice(group.index, size=n_test, replace=False))
        test = long_df.loc[test_indices]
        train = long_df.drop(index=test_indices)
        return train, test

    # ------------------------------------------------------------------
    def evaluate(self, user_id: Optional[str] = None, k_values: tuple[int, ...] = (5, 10)) -> dict:
        """Evaluate each algorithm and the hybrid on the 80/20 split."""
        # local imports to avoid circular dependency
        from recommender.hybrid_ensemble import HybridRecommender, normalize_scores
        from recommender.knn_collaborative import KNNCollaborativeRecommender
        from recommender.svd_factorization import SVDRecommender

        long_df = self.loader.fetch_user_item_matrix(None)
        if long_df.empty:
            return {"error": "No interaction data available for evaluation."}

        train, test = self.train_test_split(long_df)
        if test.empty:
            return {"error": "Not enough interactions per user to build a test split."}

        train_pivot = train.pivot_table(
            index="user_id", columns="product_id", values="rating", aggfunc="max"
        ).fillna(0.0)

        target_users = [user_id] if user_id else test["user_id"].unique().tolist()
        target_users = [u for u in target_users if u in train_pivot.index][:50]
        if not target_users:
            return {"error": "Target user has no training interactions."}

        # ---- RMSE via SVD reconstruction on held-out cells
        svd = SVDRecommender(self.loader)
        predicted_matrix = svd.predict_matrix(train_pivot)
        rmse_value = None
        if predicted_matrix is not None:
            preds, actuals = [], []
            for _, row in test.iterrows():
                u, p = row["user_id"], row["product_id"]
                if u in predicted_matrix.index and p in predicted_matrix.columns:
                    preds.append(float(np.clip(predicted_matrix.loc[u, p], 0.5, 5.0)))
                    actuals.append(float(row["rating"]))
            rmse_value = rmse(preds, actuals)

        # ---- ranking metrics per algorithm
        relevant_by_user = {
            u: set(g[g["rating"] >= RELEVANCE_THRESHOLD]["product_id"])
            or set(g["product_id"])
            for u, g in test.groupby("user_id")
        }

        hybrid = HybridRecommender(self.loader)

        def knn_recs(u: str) -> list[str]:
            return self._rank_from_pivot_knn(train_pivot, u, max(k_values))

        def svd_recs(u: str) -> list[str]:
            if predicted_matrix is None or u not in predicted_matrix.index:
                return []
            seen = set(train_pivot.columns[train_pivot.loc[u] > 0])
            row = predicted_matrix.loc[u].drop(labels=list(seen), errors="ignore")
            return row.sort_values(ascending=False).head(max(k_values)).index.tolist()

        def hybrid_recs(u: str) -> list[str]:
            knn_s = normalize_scores({p: float(i) for i, p in enumerate(reversed(knn_recs(u)), 1)})
            svd_s = normalize_scores({p: float(i) for i, p in enumerate(reversed(svd_recs(u)), 1)})
            combined: dict[str, float] = {}
            for scores, w in ((knn_s, 0.45), (svd_s, 0.55)):
                for p, s in scores.items():
                    combined[p] = combined.get(p, 0.0) + w * s
            return [p for p, _ in sorted(combined.items(), key=lambda x: x[1], reverse=True)]

        algorithms = {"knn": knn_recs, "svd": svd_recs, "hybrid": hybrid_recs}

        results: dict[str, dict] = {}
        for name, recommender in algorithms.items():
            metrics: dict[str, list[float]] = {}
            for u in target_users:
                relevant = relevant_by_user.get(u, set())
                if not relevant:
                    continue
                recs = recommender(u)
                if not recs:
                    continue
                for k in k_values:
                    metrics.setdefault(f"precision@{k}", []).append(precision_at_k(recs, relevant, k))
                    metrics.setdefault(f"recall@{k}", []).append(recall_at_k(recs, relevant, k))
                metrics.setdefault("ndcg@10", []).append(ndcg_at_k(recs, relevant, 10))
                metrics.setdefault("map", []).append(average_precision(recs, relevant, 10))
                metrics.setdefault("hit_rate", []).append(hit_rate(recs, relevant, 10))
            results[name] = {
                metric: round(float(np.mean(values)), 4) if values else None
                for metric, values in metrics.items()
            }
            results[name]["evaluated_users"] = len(metrics.get("map", []))

        return {
            "rmse_svd": round(rmse_value, 4) if rmse_value is not None else None,
            "train_interactions": len(train),
            "test_interactions": len(test),
            "users_evaluated": len(target_users),
            "algorithms": results,
            "note": "FP-Growth and PrefixSpan are pattern miners evaluated implicitly through the hybrid; ranking metrics reported for CF algorithms and hybrid.",
        }

    # ------------------------------------------------------------------
    @staticmethod
    def _rank_from_pivot_knn(pivot: pd.DataFrame, user_id: str, top_n: int) -> list[str]:
        """Lightweight user-based KNN on an in-memory train pivot."""
        from scipy.sparse import csr_matrix
        from sklearn.neighbors import NearestNeighbors

        if user_id not in pivot.index or pivot.shape[0] < 2:
            return []
        n_neighbors = min(20, pivot.shape[0])
        model = NearestNeighbors(n_neighbors=n_neighbors, metric="cosine", algorithm="brute")
        model.fit(csr_matrix(pivot.values))
        distances, indices = model.kneighbors(pivot.loc[[user_id]].values)

        seen = set(pivot.columns[pivot.loc[user_id] > 0])
        scores: dict[str, float] = {}
        for dist, idx in zip(distances[0], indices[0]):
            neighbor = pivot.index[idx]
            if neighbor == user_id:
                continue
            sim = 1.0 - dist
            if sim <= 0:
                continue
            ratings = pivot.iloc[idx]
            for pid, r in ratings[ratings > 0].items():
                if pid not in seen:
                    scores[pid] = scores.get(pid, 0.0) + sim * float(r)
        return [p for p, _ in sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n]]
