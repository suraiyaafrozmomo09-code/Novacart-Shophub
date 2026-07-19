"use client";

import type { Category, Product, ProductVariant } from "@/types";

type ProductLike = Product & { category?: Category };

/**
 * Maps product keywords to local image paths that exist on disk.
 * First matching pattern wins — more specific patterns should come first.
 */
const keywordImageMap: Array<{ keywords: string[]; path: string }> = [
  // Baby & Kids
  { keywords: ["onesie", "baby cotton onesie"], path: "/product-images/onesie.jpg" },
  { keywords: ["romper", "baby romper"], path: "/product-images/romper.jpg" },
  { keywords: ["winter jacket", "baby winter jacket", "kids winter jacket"], path: "/product-images/winter-jacket.jpg" },
  { keywords: ["baby leggings", "baby cotton leggings"], path: "/product-images/jeans.jpg" },
  { keywords: ["kidswear"], path: "/product-images/kidswear.jpg" },

  // Men's Clothing – Panjabi
  { keywords: ["festival panjabi", "festival embroidered panjabi"], path: "/product-images/festival-panjabi.jpg" },
  { keywords: ["panjabi", "traditional panjabi", "traditional cotton panjabi"], path: "/product-images/panjabi.jpg" },

  // Men's Clothing – Shirts
  { keywords: ["classic cotton shirt", "classic shirt"], path: "/product-images/classic-shirt.jpg" },
  { keywords: ["flannel", "flannel shirt", "flannel check"], path: "/product-images/flannel-shirt.jpg" },

  // Men's Clothing – T-Shirts
  { keywords: ["minimal graphic tee", "minimal graphic t-shirt"], path: "/product-images/minimal-graphic-tee.jpg" },
  { keywords: ["t-shirt", "tshirt", "cotton t-shirt", "premium cotton tee", "premium t-shirt"], path: "/product-images/tshirt.jpg" },

  // Men's & Women's Bottoms
  { keywords: ["chinos", "slim fit chinos"], path: "/product-images/chinos.jpg" },
  { keywords: ["dress pants", "formal pants", "formal dress pants"], path: "/product-images/dress-pants.jpg" },
  { keywords: ["shorts", "cotton shorts", "casual shorts"], path: "/product-images/shorts.jpg" },
  { keywords: ["womens jeans", "women's jeans", "skinny jeans"], path: "/product-images/womens-jeans.jpg" },
  { keywords: ["jeans", "denim jeans", "classic denim"], path: "/product-images/jeans.jpg" },
  { keywords: ["pajama", "pajama bottom", "comfort pajama"], path: "/product-images/pajama-bottom.jpg" },
  { keywords: ["joggers", "cargo joggers"], path: "/product-images/joggers.jpg" },

  // Men's Outerwear
  { keywords: ["leather jacket", "bomber jacket"], path: "/product-images/jacket.jpg" },
  { keywords: ["hoodie", "pullover hoodie"], path: "/product-images/hoodie.jpg" },
  { keywords: ["sweater", "cashmere sweater", "cashmere blend"], path: "/product-images/sweater.jpg" },
  { keywords: ["blazer", "slim fit blazer"], path: "/product-images/blazer.jpg" },
  { keywords: ["suit", "slim fit suit"], path: "/product-images/suit.jpg" },
  { keywords: ["polo", "polo shirt"], path: "/product-images/polo.jpg" },

  // Socks
  { keywords: ["socks", "cotton socks"], path: "/product-images/cotton-socks-pack.jpg" },

  // Women's Clothing – Ethnic
  { keywords: ["kurti", "embroidered kurti", "printed kurti"], path: "/product-images/kurti.jpg" },
  { keywords: ["three piece", "salwar", "kameez", "three-piece"], path: "/product-images/three-piece-salwar-kameez.jpg" },
  { keywords: ["two piece", "designer two piece"], path: "/product-images/two-piece.jpg" },

  // Women's Clothing – Tops & Dresses
  { keywords: ["printed top", "casual printed top"], path: "/product-images/printed-top.jpg" },
  { keywords: ["blouse", "silk blouse"], path: "/product-images/blouse.jpg" },
  { keywords: ["midi dress"], path: "/product-images/midi-dress.jpg" },
  { keywords: ["summer dress", "floral dress", "party gown", "evening gown"], path: "/product-images/dress.jpg" },
  { keywords: ["dress"], path: "/product-images/dress.jpg" },
  { keywords: ["leggings", "yoga leggings"], path: "/product-images/leggings.jpg" },
  { keywords: ["skirt", "mini skirt", "pleated skirt"], path: "/product-images/skirt.jpg" },

  // Accessories – Jewelry
  { keywords: ["necklace", "gold necklace", "chain necklace"], path: "/product-images/necklace.jpg" },
  { keywords: ["ring", "silver ring", "sterling ring"], path: "/product-images/ring.jpg" },
  { keywords: ["bracelet", "leather bracelet"], path: "/product-images/bracelet.jpg" },

  // Electronics – Miscellaneous
  { keywords: ["webcam", "4k webcam"], path: "/product-images/webcam.jpg" },
  { keywords: ["hub", "usb-c", "usb hub", "docking"], path: "/product-images/usb-hub.jpg" },
  { keywords: ["laptop", "ultrabook"], path: "/product-images/laptop.jpg" },
  { keywords: ["smartwatch", "fitness watch"], path: "/product-images/smartwatch.jpg" },
  { keywords: ["speaker", "bluetooth speaker"], path: "/product-images/speaker.jpg" },
  { keywords: ["keyboard", "mechanical keyboard"], path: "/product-images/keyboard.jpg" },
  { keywords: ["tablet", "ipad"], path: "/product-images/tablet.jpg" },
  { keywords: ["sunglasses"], path: "/product-images/sunglasses.jpg" },
  { keywords: ["belt", "leather belt"], path: "/product-images/belt.jpg" },
  { keywords: ["wallet", "leather wallet"], path: "/product-images/wallet.jpg" },
  { keywords: ["bag", "handbag", "tote"], path: "/product-images/tote-bag.jpg" },
  { keywords: ["crossbody", "crossbody bag"], path: "/product-images/crossbody-bag.jpg" },

  // Footwear – Men's
  { keywords: ["loafer", "leather loafer", "budget loafer"], path: "/product-images/mens-loafer.jpg" },
  { keywords: ["oxford", "oxford shoes", "formal oxford"], path: "/product-images/oxford-shoes.jpg" },
  { keywords: ["men sandal", "men's sandal", "mens sandal", "casual sandal"], path: "/product-images/mens-sandal.jpg" },
  { keywords: ["sneaker", "running sneaker"], path: "/product-images/mens-sneaker.jpg" },
  { keywords: ["running shoes", "running shoe", "athletic shoes"], path: "/product-images/running-shoes.jpg" },

  // Footwear – Women's
  { keywords: ["heel", "high heel", "stiletto", "elegant heel"], path: "/product-images/heel.jpg" },
  { keywords: ["sandal", "comfort sandal", "daily sandal"], path: "/product-images/sandal.jpg" },

  // Accessories – Watches
  { keywords: ["crystal watch", "crystal dial", "crystal dial women"], path: "/product-images/crystal-watch.jpg" },
  { keywords: ["elegant women watch", "elegant womens watch"], path: "/product-images/elegant-womens-watch.jpg" },
  { keywords: ["women watch", "women's watch", "womens watch"], path: "/product-images/womens-watch.jpg" },
  { keywords: ["watch", "analog watch", "classic watch", "signature watch"], path: "/product-images/watch.jpg" },

  // Accessories – Perfumes
  { keywords: ["men perfume", "men's perfume", "mens perfume", "premium perfume"], path: "/product-images/mens-perfume.jpg" },
  { keywords: ["rose perfume", "luxury rose", "women perfume"], path: "/product-images/perfume.jpg" },
  { keywords: ["perfume"], path: "/product-images/perfume.jpg" },

  // Electronics
  { keywords: ["smartphone", "samsung", "iphone", "phone"], path: "/product-images/smartphone.jpg" },
  { keywords: ["headphones", "headset", "noise cancel", "gaming headset", "bluetooth headphones", "wireless headphones"], path: "/product-images/headphones.jpg" },
  { keywords: ["earbuds", "bluetooth earbuds", "true wireless earbuds"], path: "/product-images/earbuds.jpg" },
  { keywords: ["charger", "adapter", "charging pad", "fast charge", "wireless charger", "usb-c charger"], path: "/product-images/charger.jpg" },
  { keywords: ["power bank", "powerbank"], path: "/product-images/powerbank.jpg" },
  { keywords: ["mouse", "wireless mouse"], path: "/product-images/mouse.jpg" },
  { keywords: ["cable", "usb cable", "usb-c cable", "charging cable"], path: "/product-images/cable.jpg" },
  { keywords: ["fan", "bladeless fan", "tower fan", "ceiling fan", "cooling fan"], path: "/product-images/fan.jpg" },
];

function text(value?: string | null) {
  return (value || "").toLowerCase();
}

/**
 * Build a searchable string from all product fields.
 * Strips apostrophes and special chars so "men's" matches "mens".
 */
function getProductSearchString(
  product: Partial<ProductLike> & { name?: string },
): string {
  const parts = [
    product.name,
    product.product_type,
    product.sub_type,
    product.category?.name,
    product.category?.slug,
    product.brand,
    product.gender,
  ];
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ");
}

/**
 * Try to match a product to a local image file by checking its name
 * and characteristics against the keyword-to-image map.
 */
function findLocalImage(
  product: Partial<ProductLike> & { name?: string },
): string | null {
  const haystack = getProductSearchString(product);
  const name = text(product.name);
  const subType = text(product.sub_type);
  const categoryName = text(product.category?.name);
  const productType = text(product.product_type);

  // Check each keyword group — first match wins
  for (const entry of keywordImageMap) {
    for (const keyword of entry.keywords) {
      const kw = keyword.toLowerCase();
      if (
        name.includes(kw) ||
        subType.includes(kw) ||
        categoryName.includes(kw) ||
        productType.includes(kw) ||
        haystack.includes(kw)
      ) {
        return entry.path;
      }
    }
  }

  return null;
}

/**
 * Build a stable, descriptive seed for picsum.photos based on the product name.
 * This ensures the same product always gets the same placeholder image,
 * even across different variants.
 */
function buildPicsumSeed(
  product: Partial<ProductLike> & { name?: string },
  variant?: Partial<ProductVariant>,
): string {
  // Use product name as the primary seed for consistency
  const nameSlug = (product.name || "product")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 60);

  // Append variant info so different variants can have different images
  const variantSlug = [variant?.color, variant?.size]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  const seed = variantSlug ? `${nameSlug}-${variantSlug}` : nameSlug;
  return encodeURIComponent(seed);
}

export function getProductImagePrompt(
  product: Partial<ProductLike> & { name?: string },
  variant?: Partial<ProductVariant>
) {
  const name = product.name || "product";
  const category = product.category?.name || product.product_type || "retail";
  const subtype = product.sub_type || "";
  const color = variant?.color ? `${variant.color} ` : "";
  const size = variant?.size ? ` size ${variant.size}` : "";
  const sku = variant?.sku ? ` SKU ${variant.sku}` : "";
  const lower = `${text(name)} ${text(category)} ${text(subtype)}`;

  if (lower.includes("panjabi")) {
    return `Ecommerce product photo: ${color}men's panjabi${size}, traditional bengali kurta, folded on white background, studio lighting, high detail${sku}`;
  }
  if (lower.includes("kurti")) {
    return `Ecommerce product photo: ${color}women's kurti${size}, embroidered cotton, hanging display, clean background, professional lighting${sku}`;
  }
  if (lower.includes("three piece") || lower.includes("salwar") || lower.includes("kameez")) {
    return `Ecommerce product photo: ${color}three-piece salwar kameez${size}, with dupatta, flat lay, studio photography${sku}`;
  }
  if (lower.includes("shirt") && !lower.includes("t-shirt")) {
    return `Ecommerce product photo: ${color}men's dress shirt${size}, white cotton, collar detail, front view, clean background${sku}`;
  }
  if (lower.includes("t-shirt") || lower.includes("tee")) {
    return `Ecommerce product photo: ${color}cotton t-shirt${size}, folded, neutral background, product photography${sku}`;
  }
  if (lower.includes("sock")) {
    return `Ecommerce product photo: pack of cotton socks${size}, folded neatly, retail packaging, white background${sku}`;
  }
  if (lower.includes("chinos") || lower.includes("pants")) {
    return `Ecommerce product photo: ${color}men's trousers${size}, formal wear, side view, studio lighting${sku}`;
  }
  if (lower.includes("shorts")) {
    return `Ecommerce product photo: ${color}men's casual shorts${size}, cotton fabric, flat lay, bright lighting${sku}`;
  }
  if (lower.includes("jacket")) {
    return `Ecommerce product photo: ${color}${subtype || "jacket"}${size}, leather or fabric, hanging, professional lighting${sku}`;
  }
  if (lower.includes("hoodie")) {
    return `Ecommerce product photo: ${color}hoodie${size}, cotton blend, front pocket detail, clean background${sku}`;
  }
  if (lower.includes("sweater")) {
    return `Ecommerce product photo: ${color}knit sweater${size}, crew neck, folded, soft lighting${sku}`;
  }
  if (lower.includes("blazer")) {
    return `Ecommerce product photo: ${color}formal blazer${size}, tailored fit, lapel detail, studio background${sku}`;
  }
  if (lower.includes("gown") || (lower.includes("dress") && !lower.includes("dress pants"))) {
    return `Ecommerce product photo: ${color}women's dress${size}, elegant fabric, full length, studio photography${sku}`;
  }
  if (lower.includes("leggings")) {
    return `Ecommerce product photo: ${color}leggings${size}, stretchy fabric, yoga wear, flat lay${sku}`;
  }
  if (lower.includes("skirt")) {
    return `Ecommerce product photo: ${color}pleated skirt${size}, women's fashion, A-line, clean background${sku}`;
  }
  if (lower.includes("heel")) {
    return `Ecommerce product photo: ${color}high heels${size}, women's footwear, side angle, studio lighting${sku}`;
  }
  if (lower.includes("sandal")) {
    return `Ecommerce product photo: ${color}sandals${size}, open toe, summer footwear, white background${sku}`;
  }
  if (lower.includes("shoe") || lower.includes("oxford") || lower.includes("running")) {
    return `Ecommerce product photo: ${color}footwear${size}, shoe side view, product photography, clean background${sku}`;
  }
  if (lower.includes("watch")) {
    return `Ecommerce product photo: ${color}wrist watch${size}, analog dial, leather or metal strap, macro shot${sku}`;
  }
  if (lower.includes("perfume")) {
    return `Ecommerce product photo: ${color}perfume bottle${size}, glass bottle, luxury packaging, reflective surface${sku}`;
  }
  if (lower.includes("earbuds")) {
    return `Ecommerce product photo: ${color}wireless earbuds${size}, in charging case, top view, clean background${sku}`;
  }
  if (lower.includes("headphone") || lower.includes("headset")) {
    return `Ecommerce product photo: ${color}over-ear headphones${size}, padded earcups, side view, studio lighting${sku}`;
  }
  if (lower.includes("charger") || lower.includes("cable")) {
    return `Ecommerce product photo: ${color}usb charger${size}, wall adapter, cable included, product shot${sku}`;
  }
  if (lower.includes("power bank")) {
    return `Ecommerce product photo: ${color}power bank${size}, portable battery, slim design, white background${sku}`;
  }
  if (lower.includes("mouse")) {
    return `Ecommerce product photo: ${color}wireless mouse${size}, ergonomic design, top view, clean background${sku}`;
  }
  if (lower.includes("iphone") || lower.includes("phone") || lower.includes("smartphone")) {
    return `Ecommerce product photo: smartphone${size}, modern design, screen on, studio lighting${sku}`;
  }
  if (lower.includes("laptop") || lower.includes("ultrabook")) {
    return `Ecommerce product photo: laptop${size}, open lid, silver finish, professional product photography${sku}`;
  }
  if (lower.includes("smartwatch") || (lower.includes("smart") && lower.includes("watch"))) {
    return `Ecommerce product photo: ${color}smartwatch${size}, fitness tracker, AMOLED display, wrist shot${sku}`;
  }
  if (lower.includes("speaker")) {
    return `Ecommerce product photo: ${color}bluetooth speaker${size}, portable, cylindrical, fabric mesh, clean background${sku}`;
  }
  if (lower.includes("keyboard")) {
    return `Ecommerce product photo: ${color}mechanical keyboard${size}, RGB backlit, full size, top-down view${sku}`;
  }
  if (lower.includes("tablet") || lower.includes("protab") || lower.includes("ipad")) {
    return `Ecommerce product photo: tablet${size}, slim bezel, screen on, standing angle, white background${sku}`;
  }
  if (lower.includes("necklace")) {
    return `Ecommerce product photo: ${color}necklace${size}, pendant detail, jewelry photography, macro lens${sku}`;
  }
  if (lower.includes("ring") && !lower.includes("charger")) {
    return `Ecommerce product photo: ${color}ring${size}, band detail, jewelry shot, reflective surface${sku}`;
  }
  if (lower.includes("bracelet")) {
    return `Ecommerce product photo: ${color}bracelet${size}, leather or beaded, wrist accessory, studio lighting${sku}`;
  }
  if (lower.includes("suit") && !lower.includes("three piece")) {
    return `Ecommerce product photo: ${color}men's suit${size}, two-piece, tailored, hanging, professional lighting${sku}`;
  }
  if (lower.includes("polo")) {
    return `Ecommerce product photo: ${color}polo shirt${size}, pique cotton, collar detail, flat lay${sku}`;
  }
  if (lower.includes("blouse")) {
    return `Ecommerce product photo: ${color}silk blouse${size}, women's top, elegant drape, studio background${sku}`;
  }
  if (lower.includes("webcam")) {
    return `Ecommerce product photo: 4k webcam${size}, clip-on design, lens detail, product photography${sku}`;
  }
  if (lower.includes("hub") || lower.includes("usb-c")) {
    return `Ecommerce product photo: usb-c hub${size}, multi-port, aluminum finish, top view${sku}`;
  }
  if (lower.includes("baby")) {
    return `Ecommerce product photo: ${color}baby clothing${size}, soft cotton, cute design, flat lay, bright lighting${sku}`;
  }

  return `Ecommerce product photo: ${color}${name}${size}, professional product photography, clean white background, high detail${sku}`;
}

/**
 * Returns the best image URL for a product/variant combination.
 *
 * Priority order:
 * 1. Variant's image URL (if it's an http or absolute path) – handles unsplash URLs
 * 2. Local image matched by product keywords (name, sub_type, category, etc.)
 * 3. picsum.photos placeholder with a descriptive product-name seed
 */
export function getProductDisplaySrc(
  product: Partial<ProductLike> & { name?: string },
  variant?: Partial<ProductVariant>
) {
  const src = variant?.image || "";

  // 1. If variant has an explicit http image URL (e.g. unsplash) or local path, use it directly
  if (src) {
    return src;
  }

  // 2. Try to find a matching local image based on product characteristics
  const localImage = findLocalImage(product);
  if (localImage) {
    return localImage;
  }

  // 3. Fallback: picsum.photos with a descriptive product-based seed
  const seed = buildPicsumSeed(product, variant);
  return `https://picsum.photos/seed/${seed}/400/400.jpg`;
}

export function getProductDisplayId(product: Partial<ProductLike> & { id?: string; product_code?: string }) {
  if (product.product_code) return product.product_code;
  if (product.id) return product.id;
  return "Unavailable";
}
