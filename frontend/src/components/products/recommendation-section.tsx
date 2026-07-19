"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/layout/supabase-provider";
import { SmartImage } from "@/components/ui/smart-image";
import { Tilt } from "@/components/core/tilt";
import { getProductDisplaySrc, getProductImagePrompt } from "@/lib/product-media";
import {
  fetchProductRecommendations,
  trackRecommendationClick,
} from "@/lib/track";
import {
  buildRecommendations,
  formatCurrency,
  type ProductWithRelations,
} from "@/lib/storefront";

interface Recommendation {
  id: string;
  name: string;
  category?: string;
  price?: number;
  image?: string;
  aiRecommended?: boolean;
  reason?: string;
}

interface RecommendationSectionProps {
  productId: string;
  productName: string;
  recommendations?: Recommendation[];
  /** Set false to skip the ML backend and use only the client-side rules. */
  useMlBackend?: boolean;
}

export default function RecommendationSection({
  productId,
  productName,
  recommendations: providedRecommendations,
  useMlBackend = true,
}: RecommendationSectionProps) {
  const { user } = useAuth();
  const [fetchedRecommendations, setFetchedRecommendations] = useState<Recommendation[]>([]);
  const [recommendationLogId, setRecommendationLogId] = useState<string | null>(null);
  const [hasAiResults, setHasAiResults] = useState(false);
  const [loading, setLoading] = useState(!providedRecommendations);
  const [error, setError] = useState<string | null>(null);
  const normalizedProvidedRecommendations = useMemo(() => providedRecommendations || [], [providedRecommendations]);
  const displayedRecommendations = normalizedProvidedRecommendations.length > 0
    ? normalizedProvidedRecommendations
    : fetchedRecommendations;

  useEffect(() => {
    if (normalizedProvidedRecommendations.length > 0) {
      return;
    }

    let cancelled = false;

    const fetchClientSide = async (): Promise<Recommendation[]> => {
      const { data, error: queryError } = await supabase
        .from("products")
        .select("*, category:categories(*), variants:product_variants(*)")
        .eq("status", "active");

      if (queryError) {
        throw queryError;
      }

      const catalog = (data || []) as ProductWithRelations[];
      const activeProduct = catalog.find((product) => product.id === productId);

      if (!activeProduct) {
        return [];
      }

      return buildRecommendations([activeProduct], catalog, 4).map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category?.name,
        price: product.variants?.[0]?.price || 0,
        image: product.variants?.[0]?.image,
      }));
    };

    const fetchRecommendations = async () => {
      try {
        // Client-side rule-based recommendations render first (fast path)...
        const ruleBased = await fetchClientSide();
        if (!cancelled) {
          setFetchedRecommendations(ruleBased);
          setLoading(false);
        }

        // ...then the ML backend enhances/replaces them when it responds.
        if (useMlBackend) {
          const backend = await fetchProductRecommendations(productId, 4);
          if (!cancelled && backend && backend.products.length > 0) {
            const aiItems: Recommendation[] = backend.products.map((p) => ({
              id: p.product_id,
              name: p.name || "Product",
              category: p.category,
              price: p.price || 0,
              image: p.image,
              aiRecommended: true,
              reason: p.reason,
            }));
            setFetchedRecommendations(aiItems);
            setRecommendationLogId(backend.recommendation_log_id || null);
            setHasAiResults(true);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        }
      }
    };

    if (productId) {
      void fetchRecommendations();
    }

    return () => {
      cancelled = true;
    };
  }, [productId, normalizedProvidedRecommendations, useMlBackend]);

  const handleRecommendationClick = (clickedProductId: string) => {
    trackRecommendationClick({
      recommendationLogId,
      clickedProductId,
      userId: user?.id ?? null,
    });
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
      </div>
    );
  }

  if (error || displayedRecommendations.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-white/48">No recommendations available right now</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-[-0.03em] text-white">
          Frequently bought together
          {hasAiResults && (
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
              <Sparkles size={12} />
              AI Recommended
            </span>
          )}
        </h2>
        <p className="text-sm text-white/48">
          Complete the look with pieces that pair naturally with `{productName}`.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedRecommendations.map((product) => (
          <Tilt key={product.id} rotationFactor={8} isRevese>
            <Link
              href={`/products/${product.id}`}
              onClick={() => handleRecommendationClick(product.id)}
              className="group block overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_70px_rgba(3,2,10,0.32)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:shadow-[0_30px_90px_rgba(3,2,10,0.4)]"
            >
              <div className="relative aspect-square overflow-hidden bg-[#140d20]">
                <SmartImage
                  src={getProductDisplaySrc({ name: product.name, product_type: product.category }, { image: product.image })}
                  alt={product.name}
                  fallbackPrompt={getProductImagePrompt({ name: product.name, product_type: product.category })}
                  fallbackSrc={getProductDisplaySrc({ name: product.name, product_type: product.category })}
                  imageSize="square"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.aiRecommended && (
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300 backdrop-blur-xl">
                    <Sparkles size={10} />
                    AI
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="mb-1 text-xs uppercase tracking-[0.18em] text-white/45">
                  {product.category}
                </p>
                <h3 className="line-clamp-2 text-sm font-semibold text-white transition-colors group-hover:text-white/82">
                  {product.name}
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    {formatCurrency(product.price || 0)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-white/45">
                    <TrendingUp size={12} />
                    <span>{product.reason ? "Personalized" : "Recommended"}</span>
                  </div>
                </div>
              </div>
            </Link>
          </Tilt>
        ))}
      </div>
    </div>
  );
}
