"use client";

import type { CartItem, Category, Product } from "@/types";

export interface ProductWithRelations extends Product {
  category?: Category;
}

const COMPLEMENTARY_RULES: Array<{
  match: string[];
  targets: string[];
}> = [
  { match: ["t-shirt", "tee", "shirt"], targets: ["pants", "watch", "perfume", "shorts"] },
  { match: ["panjabi", "kurti", "two-piece", "three-piece"], targets: ["pajama", "watch", "perfume", "sandal"] },
  { match: ["pants", "shorts"], targets: ["shirt", "t-shirt", "watch", "perfume"] },
  { match: ["watch"], targets: ["shirt", "t-shirt", "panjabi", "perfume"] },
  { match: ["perfume"], targets: ["watch", "shirt", "kurti"] },
  { match: ["phone", "smartphone"], targets: ["charger", "earbuds", "headphones", "powerbank", "cables"] },
  { match: ["earbuds", "headphones"], targets: ["phone", "charger", "powerbank"] },
  { match: ["baby"], targets: ["onesie", "romper", "jacket"] },
];

function tokenize(value: string | undefined | null) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function getProductLabel(product: ProductWithRelations) {
  return [
    product.name,
    product.brand,
    product.product_type,
    product.sub_type,
    product.category?.name,
    product.category?.slug,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getProductMinPrice(product: ProductWithRelations) {
  if (!product.variants?.length) return 0;
  return Math.min(...product.variants.map((variant) => variant.price));
}

export function getProductMaxPrice(product: ProductWithRelations) {
  if (!product.variants?.length) return 0;
  return Math.max(...product.variants.map((variant) => variant.price));
}

export function getProductStock(product: ProductWithRelations) {
  return product.variants?.reduce((sum, variant) => sum + variant.quantity, 0) || 0;
}

export const USD_TO_BDT_RATE = 122;
export const FREE_SHIPPING_THRESHOLD_USD = 50;
export const STANDARD_SHIPPING_USD = 5.99;

export function convertUsdToBdt(amount: number) {
  return amount * USD_TO_BDT_RATE;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(convertUsdToBdt(amount));
}

export function formatShippingLabel(amount: number) {
  return amount === 0 ? "Free" : formatCurrency(amount);
}

export function productMatchesQuery(product: ProductWithRelations, query: string) {
  if (!query.trim()) return true;

  const normalizedQuery = query.trim().toLowerCase();
  const haystack = getProductLabel(product).toLowerCase();
  return haystack.includes(normalizedQuery);
}

export function buildSearchSuggestions(
  query: string,
  products: ProductWithRelations[],
  limit = 6
) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return products
    .map((product) => {
      const haystack = getProductLabel(product).toLowerCase();
      let score = 0;

      if (product.name.toLowerCase().startsWith(normalizedQuery)) score += 12;
      if (product.name.toLowerCase().includes(normalizedQuery)) score += 8;
      if (product.sub_type?.toLowerCase().startsWith(normalizedQuery)) score += 7;
      if (product.category?.name?.toLowerCase().includes(normalizedQuery)) score += 4;
      if (product.brand?.toLowerCase().includes(normalizedQuery)) score += 3;
      if (haystack.includes(normalizedQuery)) score += 2;

      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || getProductStock(b.product) - getProductStock(a.product))
    .slice(0, limit)
    .map(({ product }) => product);
}

function getComplementaryTargets(product: ProductWithRelations) {
  const tokens = tokenize(getProductLabel(product));
  const targetSet = new Set<string>();

  for (const rule of COMPLEMENTARY_RULES) {
    if (rule.match.some((term) => tokens.includes(term) || tokens.some((token) => token.includes(term)))) {
      for (const target of rule.targets) {
        targetSet.add(target);
      }
    }
  }

  return [...targetSet];
}

function scoreRelationship(seed: ProductWithRelations, candidate: ProductWithRelations) {
  if (seed.id === candidate.id) return -Infinity;
  if (getProductStock(candidate) <= 0) return -Infinity;

  let score = 0;
  const seedTokens = tokenize(getProductLabel(seed));
  const candidateTokens = tokenize(getProductLabel(candidate));
  const complementaryTargets = getComplementaryTargets(seed);

  if (seed.category_id === candidate.category_id) score += 7;
  if (seed.product_type === candidate.product_type) score += 4;
  if (seed.sub_type && seed.sub_type === candidate.sub_type) score += 6;
  if (seed.gender === candidate.gender || candidate.gender === "unisex") score += 3;

  for (const target of complementaryTargets) {
    if (candidateTokens.some((token) => token.includes(target))) {
      score += 10;
    }
  }

  const overlappingTokens = candidateTokens.filter((token) => seedTokens.includes(token));
  score += overlappingTokens.length;

  score += Math.min(getProductStock(candidate), 20) / 20;
  score += Math.min(candidate.average_rating || 0, 5);

  return score;
}

export function buildRecommendations(
  seedProducts: ProductWithRelations[],
  catalog: ProductWithRelations[],
  limit = 4
) {
  const scoreMap = new Map<string, number>();

  for (const seed of seedProducts) {
    for (const candidate of catalog) {
      const score = scoreRelationship(seed, candidate);
      if (score <= 0) continue;
      scoreMap.set(candidate.id, Math.max(scoreMap.get(candidate.id) || 0, score));
    }
  }

  const seedIds = new Set(seedProducts.map((product) => product.id));

  return catalog
    .filter((product) => !seedIds.has(product.id))
    .map((product) => ({ product, score: scoreMap.get(product.id) || 0 }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
}

export function buildCartSeedProducts(items: Array<CartItem & { product?: ProductWithRelations }>) {
  return items
    .map((item) => item.product)
    .filter((product): product is ProductWithRelations => Boolean(product));
}

export function buildHeroProducts(products: ProductWithRelations[]) {
  return [...products]
    .sort((a, b) => {
      const ratingDelta = (b.average_rating || 0) - (a.average_rating || 0);
      if (ratingDelta !== 0) return ratingDelta;
      return getProductStock(b) - getProductStock(a);
    })
    .slice(0, 5);
}
