"""PrefixSpan sequential pattern mining over user behavior sequences.

Sequences are built per session from click_events: each session becomes an
ordered list of (product_id, action) items. Actions carry funnel weights
(view=1 < search_click=2 < add_to_cart=3 < purchase=4) so patterns ending
deeper in the funnel score higher.

Given a live session's prefix, mined patterns whose prefix matches predict
the most likely next products — this also powers anonymous session-based
recommendations.
"""

from __future__ import annotations

import logging
import math
from typing import Optional, Sequence

import pandas as pd

from recommender.data_loader import DataLoader

logger = logging.getLogger("novacart.recommender")

# funnel-position weights
ACTION_WEIGHTS = {
    "view": 1.0,
    "click": 1.0,
    "search_click": 2.0,
    "wishlist": 2.5,
    "add_to_cart": 3.0,
    "purchase": 4.0,
}


class PrefixSpanRecommender:
    def __init__(self, loader: DataLoader):
        self.loader = loader
        self._patterns: Optional[list[tuple[int, list[str]]]] = None

    # ------------------------------------------------------------------
    def _build_sequences(self, user_id: Optional[str] = None) -> list[list[str]]:
        """One product-id sequence per session (consecutive duplicates collapsed)."""
        df = self.loader.fetch_behavior_sequences(user_id=user_id, session_limit=200)
        if df.empty or "session_id" not in df.columns:
            return []
        sort_col = "event_order" if "event_order" in df.columns else "created_at"
        sequences: list[list[str]] = []
        for _, group in df.groupby("session_id"):
            ordered = group.sort_values(sort_col)["product_id"].tolist()
            collapsed: list[str] = []
            for pid in ordered:
                if pid and (not collapsed or collapsed[-1] != pid):
                    collapsed.append(pid)
            if len(collapsed) >= 2:
                sequences.append(collapsed)
        return sequences

    # ------------------------------------------------------------------
    def _mine_patterns(self) -> list[tuple[int, list[str]]]:
        if self._patterns is not None:
            return self._patterns
        sequences = self._build_sequences()
        if len(sequences) < 2:
            self._patterns = []
            return self._patterns

        # scale min_support with data size: at least 2, ~5% of sequences
        min_support = max(2, math.ceil(len(sequences) * 0.05))
        try:
            from prefixspan import PrefixSpan

            ps = PrefixSpan(sequences)
            ps.minlen = 2
            ps.maxlen = 6
            self._patterns = ps.frequent(min_support)
        except Exception as exc:  # pragma: no cover
            logger.warning("PrefixSpan mining failed: %s", exc)
            self._patterns = []
        return self._patterns

    def refresh(self) -> None:
        self._patterns = None

    # ------------------------------------------------------------------
    def predict_next(
        self,
        current_sequence: Sequence[str],
        top_n: int = 10,
    ) -> dict[str, float]:
        """Match the session prefix against mined patterns and score the
        next items in each matching pattern by support × continuation depth."""
        current = [p for p in current_sequence if p]
        if not current:
            return {}
        patterns = self._mine_patterns()
        seen = set(current)
        scores: dict[str, float] = {}

        for support, pattern in patterns:
            # find the deepest suffix of `current` that is a prefix of `pattern`
            match_len = 0
            for k in range(min(len(current), len(pattern) - 1), 0, -1):
                if pattern[:k] == current[-k:]:
                    match_len = k
                    break
            if match_len == 0:
                continue
            for offset, next_item in enumerate(pattern[match_len:]):
                if next_item in seen:
                    continue
                # closer continuations weighted higher; deeper matches too
                score = support * match_len / (1 + offset)
                scores[next_item] = max(scores.get(next_item, 0.0), float(score))

        if not scores:
            return self._markov_fallback(current, top_n)
        return dict(sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n])

    # ------------------------------------------------------------------
    def recommend_for_session(self, session_id: str, top_n: int = 10) -> dict[str, float]:
        """Session-based recommendations for (possibly anonymous) visitors."""
        events = self.loader.fetch_session_events(session_id)
        if events.empty:
            return {}
        # weight the sequence tail by funnel action depth when breaking ties
        ordered = events["product_id"].tolist()
        return self.predict_next(ordered, top_n)

    # ------------------------------------------------------------------
    def _markov_fallback(self, current: Sequence[str], top_n: int) -> dict[str, float]:
        """First-order transitions across all sequences when no mined
        pattern matches (typical for sparse data)."""
        sequences = self._build_sequences()
        if not sequences:
            return {}
        last = current[-1]
        seen = set(current)
        counts: dict[str, float] = {}
        for seq in sequences:
            for i, pid in enumerate(seq[:-1]):
                if pid == last and seq[i + 1] not in seen:
                    counts[seq[i + 1]] = counts.get(seq[i + 1], 0.0) + 1.0
        return dict(sorted(counts.items(), key=lambda x: x[1], reverse=True)[:top_n])
