"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SmartImage } from "@/components/ui/smart-image";
import { Tilt } from "@/components/core/tilt";
import { getProductDisplaySrc, getProductImagePrompt } from "@/lib/product-media";
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
}

interface RecommendationSectionProps {
  productId: string;
  productName: string;
  recommendations?: Recommendation[];
}

export default function RecommendationSection({ 
  productId, 
  productName,
  recommendations: providedRecommendations 
}: RecommendationSectionProps) {
  const [fetchedRecommendations, setFetchedRecommendations] = useState<Recommendation[]>([]);
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

    const fetchRecommendations = async () => {
      try {
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
          setFetchedRecommendations([]);
          return;
        }

        const items = buildRecommendations([activeProduct], catalog, 4).map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category?.name,
          price: product.variants?.[0]?.price || 0,
          image: product.variants?.[0]?.image,
        }));

        setFetchedRecommendations(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRecommendations();
    }
  }, [productId, normalizedProvidedRecommendations]);

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
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
          Frequently bought together
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
              className="group block overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_70px_rgba(3,2,10,0.32)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:shadow-[0_30px_90px_rgba(3,2,10,0.4)]"
            >
              <div className="relative aspect-square overflow-hidden bg-[#140d20]">
                <SmartImage
                  src={getProductDisplaySrc({ name: product.name, product_type: product.category }, { image: product.image })}
                  alt={product.name}
                  fallbackPrompt={getProductImagePrompt({ name: product.name, product_type: product.category })}
                  imageSize="square"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
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
                    <span>Recommended</span>
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
