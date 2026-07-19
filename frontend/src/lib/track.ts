"use client";

/**
 * Behavioral event tracking for the NovaCart recommendation backend.
 *
 * All calls are fire-and-forget: tracking must never break the shopping
 * experience, so failures are swallowed (logged to console in dev).
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_RECOMMENDER_API_URL || "http://localhost:8000";

const SESSION_KEY = "novacart_session_id";

export type TrackEventType =
  | "view"
  | "click"
  | "add_to_cart"
  | "remove_from_cart"
  | "purchase"
  | "search_click"
  | "wishlist";

/** Stable per-browser-session id used to stitch anonymous behavior sequences. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = window.sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

async function post(path: string, body: unknown): Promise<Response | null> {
  try {
    return await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[track] ${path} failed`, error);
    }
    return null;
  }
}

/** Log a product interaction (view / click / add_to_cart / purchase / ...). */
export function trackEvent(
  eventType: TrackEventType,
  data: {
    productId: string;
    variantId?: string | null;
    userId?: string | null;
  }
): void {
  if (!data.productId) return;
  void post("/api/events/click", {
    user_id: data.userId ?? null,
    product_id: data.productId,
    variant_id: data.variantId ?? null,
    event_type: eventType,
    session_id: getSessionId(),
  });
}

/** Log a search query and how many results it produced. */
export function trackSearch(
  query: string,
  resultsCount: number,
  userId?: string | null
): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  void post("/api/events/search", {
    user_id: userId ?? null,
    query: trimmed,
    results_count: resultsCount,
    session_id: getSessionId(),
  });
}

/** Tell the backend which served recommendation was clicked. */
export function trackRecommendationClick(data: {
  recommendationLogId?: string | null;
  clickedProductId: string;
  userId?: string | null;
}): void {
  void post("/api/recommendations/feedback", {
    recommendation_log_id: data.recommendationLogId ?? null,
    user_id: data.userId ?? null,
    session_id: getSessionId(),
    clicked_product_id: data.clickedProductId,
  });
}

export interface BackendRecommendation {
  product_id: string;
  score: number;
  reason?: string;
  breakdown?: Record<string, number>;
  name?: string;
  category?: string;
  price?: number;
  image?: string;
}

export interface BackendRecommendationResponse {
  method: string;
  recommendation_log_id?: string | null;
  count: number;
  products: BackendRecommendation[];
}

/** Fetch ML-backed recommendations for a product page (item KNN + FP-Growth). */
export async function fetchProductRecommendations(
  productId: string,
  topN = 4
): Promise<BackendRecommendationResponse | null> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/recommendations/product/${productId}?top_n=${topN}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return null;
    return (await res.json()) as BackendRecommendationResponse;
  } catch {
    return null;
  }
}
