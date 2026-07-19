"""NovaCart hybrid recommendation engine.

Modules:
- data_loader: Supabase data access + user-item matrix construction
- knn_collaborative: KNN collaborative filtering (user- and item-based)
- svd_factorization: TruncatedSVD matrix factorization
- fp_growth_association: FP-Growth association rule mining
- prefixspan_sequential: PrefixSpan sequential pattern mining
- hybrid_ensemble: weighted ensemble combiner with diversity + novelty
- evaluation: offline metrics (RMSE, Precision@K, Recall@K, NDCG, MAP, Hit Rate)
"""

from recommender.data_loader import DataLoader
from recommender.hybrid_ensemble import HybridRecommender, DEFAULT_WEIGHTS

__all__ = ["DataLoader", "HybridRecommender", "DEFAULT_WEIGHTS"]
