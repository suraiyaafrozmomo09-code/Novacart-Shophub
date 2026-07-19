"""FP-Growth association rule mining with mlxtend.

Builds one-hot encoded transactions (order_id × product_id) from completed
orders, mines frequent itemsets with fpgrowth (min_support=0.01), derives
association rules filtered by lift >= 1.0, and answers:
- "customers whose cart contains X also bought Y" (rule matching)
- "frequently bought together" bundles for product pages
"""

from __future__ import annotations

import logging
from typing import Iterable, Optional

import pandas as pd

from recommender.data_loader import DataLoader

logger = logging.getLogger("novacart.recommender")

MIN_SUPPORT = 0.01
MIN_LIFT = 1.0


class FPGrowthRecommender:
    def __init__(self, loader: DataLoader, min_support: float = MIN_SUPPORT, min_lift: float = MIN_LIFT):
        self.loader = loader
        self.min_support = min_support
        self.min_lift = min_lift
        self._rules: Optional[pd.DataFrame] = None

    # ------------------------------------------------------------------
    def _mine_rules(self) -> pd.DataFrame:
        if self._rules is not None:
            return self._rules
        try:
            from mlxtend.frequent_patterns import association_rules, fpgrowth
        except ImportError:  # pragma: no cover
            logger.warning("mlxtend not installed; FP-Growth disabled")
            self._rules = pd.DataFrame()
            return self._rules

        transactions = self.loader.fetch_transactions()
        if transactions.empty or transactions["order_id"].nunique() < 2:
            self._rules = pd.DataFrame()
            return self._rules

        # one-hot: order_id × product_id
        basket = (
            transactions.assign(present=True)
            .pivot_table(index="order_id", columns="product_id", values="present",
                         aggfunc="any", fill_value=False)
            .astype(bool)
        )

        try:
            itemsets = fpgrowth(basket, min_support=self.min_support, use_colnames=True)
            if itemsets.empty:
                self._rules = pd.DataFrame()
                return self._rules
            rules = association_rules(itemsets, metric="lift", min_threshold=self.min_lift)
        except Exception as exc:  # pragma: no cover
            logger.warning("FP-Growth mining failed: %s", exc)
            rules = pd.DataFrame()

        self._rules = rules
        return rules

    def refresh(self) -> None:
        self._rules = None

    # ------------------------------------------------------------------
    def recommend_for_basket(self, product_ids: Iterable[str], top_n: int = 10) -> dict[str, float]:
        """Rules whose antecedents are contained in the basket; consequents
        scored by lift (max across matching rules)."""
        basket = set(product_ids)
        if not basket:
            return {}
        rules = self._mine_rules()
        if rules.empty:
            return self._pair_fallback(basket, top_n)

        scores: dict[str, float] = {}
        for _, rule in rules.iterrows():
            antecedents = set(rule["antecedents"])
            if not antecedents.issubset(basket):
                continue
            for consequent in rule["consequents"]:
                if consequent in basket:
                    continue
                lift = float(rule["lift"])
                scores[consequent] = max(scores.get(consequent, 0.0), lift)

        if not scores:
            return self._pair_fallback(basket, top_n)
        return dict(sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n])

    # ------------------------------------------------------------------
    def frequently_bought_together(self, product_id: str, top_n: int = 6) -> dict[str, float]:
        """Bundles for the product detail page."""
        return self.recommend_for_basket([product_id], top_n)

    # ------------------------------------------------------------------
    def _pair_fallback(self, basket: set[str], top_n: int) -> dict[str, float]:
        """Raw co-occurrence counts when rule mining yields nothing
        (small datasets rarely clear support thresholds)."""
        transactions = self.loader.fetch_transactions()
        if transactions.empty:
            return {}
        orders_with_seed = transactions[transactions["product_id"].isin(basket)]["order_id"].unique()
        if len(orders_with_seed) == 0:
            return {}
        co_items = transactions[
            transactions["order_id"].isin(orders_with_seed)
            & ~transactions["product_id"].isin(basket)
        ]
        counts = co_items["product_id"].value_counts()
        return {pid: float(count) for pid, count in counts.head(top_n).items()}
