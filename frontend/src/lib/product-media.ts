"use client";

import type { Category, Product, ProductVariant } from "@/types";

type ProductLike = Product & { category?: Category };

const LOCAL_PRODUCT_IMAGES = {
  heroEditorial: "/product-images/hero-editorial.jpg",
  panjabi: "/product-images/panjabi.jpg",
  tshirt: "/product-images/tshirt.jpg",
  classicShirt: "/product-images/classic-shirt.jpg",
  flannelShirt: "/product-images/flannel-shirt.jpg",
  chinos: "/product-images/chinos.jpg",
  dressPants: "/product-images/dress-pants.jpg",
  shorts: "/product-images/shorts.jpg",
  watch: "/product-images/watch.jpg",
  womensWatch: "/product-images/womens-watch.jpg",
  crystalWatch: "/product-images/crystal-watch.jpg",
  elegantWomensWatch: "/product-images/elegant-womens-watch.jpg",
  headphones: "/product-images/headphones.jpg",
  perfume: "/product-images/perfume.jpg",
  mensPerfume: "/product-images/mens-perfume.jpg",
  sandal: "/product-images/sandal.jpg",
  heel: "/product-images/heel.jpg",
  mensLoafer: "/product-images/mens-loafer.jpg",
  mensSandal: "/product-images/mens-sandal.jpg",
  mensSneaker: "/product-images/mens-sneaker.jpg",
  earbuds: "/product-images/earbuds.jpg",
  kidswear: "/product-images/kidswear.jpg",
  onesie: "/product-images/onesie.jpg",
  romper: "/product-images/romper.jpg",
  kidsJacket: "/product-images/kidswear.jpg",
  winterJacket: "/product-images/winter-jacket.jpg",
  pajamaBottom: "/product-images/pajama-bottom.jpg",
  jeans: "/product-images/jeans.jpg",
  charger: "/product-images/charger.jpg",
  kurti: "/product-images/kurti.jpg",
  threePiece: "/product-images/three-piece-salwar-kameez.jpg",
  printedTop: "/product-images/printed-top.jpg",
  twoPiece: "/product-images/two-piece.jpg",
  socks: "/product-images/cotton-socks-pack.jpg",
  minimalGraphicTee: "/product-images/minimal-graphic-tee.jpg",
  festivalPanjabi: "/product-images/festival-panjabi.jpg",
  smartphone: "/product-images/smartphone.jpg",
  powerbank: "/product-images/powerbank.jpg",
  mouse: "/product-images/mouse.jpg",
};

function text(value?: string | null) {
  return (value || "").toLowerCase();
}

export function getProductImagePrompt(
  product: Partial<ProductLike> & { name?: string },
  variant?: Partial<ProductVariant>
) {
  const name = product.name || "product";
  const category = product.category?.name || product.product_type || "retail";
  const subtype = product.sub_type || "";
  const color = variant?.color ? `${variant.color} ` : "";
  const lower = `${text(name)} ${text(category)} ${text(subtype)}`;

  if (lower.includes("panjabi")) {
    return `Ecommerce product image: realistic premium ${color}panjabi for men, folded and hanging studio fashion photo, soft luxury lighting, clean background`;
  }
  if (lower.includes("kurti")) {
    return `Ecommerce product image: realistic premium ${color}kurti for women, boutique fashion product photography, elegant studio lighting, clean background`;
  }
  if (lower.includes("three piece") || lower.includes("3 piece") || lower.includes("salwar") || lower.includes("kameez")) {
    return `Ecommerce product image: premium ${color}${name}, elegant three-piece salwar kameez set with matching dupatta, boutique apparel packshot, clean studio background`;
  }
  if (lower.includes("shirt")) {
    return `Ecommerce product image: realistic premium ${color}${subtype || "shirt"} fashion packshot, clean apparel studio background, front-facing catalog photo`;
  }
  if (lower.includes("sock")) {
    return `Ecommerce product image: premium ${name}, neatly packed cotton socks set, clean retail packshot, soft studio lighting, neutral background`;
  }
  if (lower.includes("pants") || lower.includes("chinos") || lower.includes("shorts")) {
    return `Ecommerce product image: realistic ${color}${name}, neatly arranged fashion packshot, premium clothing catalog style, clean background`;
  }
  if (lower.includes("watch")) {
    return `Ecommerce product image: premium ${color}${name}, luxury watch product photography, reflective studio lighting, clean dark-to-light background`;
  }
  if (lower.includes("perfume")) {
    return `Ecommerce product image: premium ${name} perfume bottle, high-end cosmetic product photography, glossy reflections, elegant clean background`;
  }
  if (lower.includes("iphone") || lower.includes("phone") || lower.includes("smartphone")) {
    return `Ecommerce product image: realistic ${name} smartphone, premium electronics catalog shot, clean studio background, polished reflections`;
  }
  if (lower.includes("earbuds") || lower.includes("headphone")) {
    return `Ecommerce product image: realistic ${name}, premium audio accessory product photo, clean studio lighting, minimal background`;
  }
  if (lower.includes("charger") || lower.includes("cable") || lower.includes("power bank")) {
    return `Ecommerce product image: realistic ${name}, electronics accessory packshot, clean studio background, crisp catalog lighting`;
  }
  if (lower.includes("baby")) {
    return `Ecommerce product image: cute realistic ${name} for babies, premium baby clothing product photography, soft lighting, clean background`;
  }

  return `Ecommerce product image: realistic ${color}${name}, premium ${category} catalog photography, clean studio background, high detail`;
}

export function getProductDisplaySrc(
  product: Partial<ProductLike> & { name?: string },
  variant?: Partial<ProductVariant>
) {
  const src = variant?.image || "";
  const name = text(product.name);
  const categoryName = text(product.category?.name);
  const categorySlug = text(product.category?.slug);
  const lower = `${text(product.name)} ${categoryName} ${categorySlug} ${text(product.product_type)} ${text(product.sub_type)} ${text(variant?.color)}`;

  if (src.includes("/product-images/") || src.includes("product-images")) {
    return src;
  }

  if (name.includes("baby cotton onesie")) return LOCAL_PRODUCT_IMAGES.onesie;
  if (name.includes("baby romper suit")) return LOCAL_PRODUCT_IMAGES.romper;
  if (name.includes("baby winter jacket")) return LOCAL_PRODUCT_IMAGES.winterJacket;
  if (name.includes("classic cotton shirt")) return LOCAL_PRODUCT_IMAGES.classicShirt;
  if (name.includes("flannel check shirt")) return LOCAL_PRODUCT_IMAGES.flannelShirt;
  if (name.includes("premium cotton t-shirt")) return LOCAL_PRODUCT_IMAGES.tshirt;
  if (name.includes("traditional cotton panjabi")) return LOCAL_PRODUCT_IMAGES.panjabi;
  if (name.includes("slim fit chinos")) return LOCAL_PRODUCT_IMAGES.chinos;
  if (name.includes("formal dress pants")) return LOCAL_PRODUCT_IMAGES.dressPants;
  if (name.includes("casual cotton shorts")) return LOCAL_PRODUCT_IMAGES.shorts;
  if (name.includes("embroidered cotton kurti")) return LOCAL_PRODUCT_IMAGES.kurti;
  if (name.includes("premium three piece suit")) return LOCAL_PRODUCT_IMAGES.threePiece;
  if (name.includes("premium three-piece suit")) return LOCAL_PRODUCT_IMAGES.threePiece;
  if (name.includes("three piece")) return LOCAL_PRODUCT_IMAGES.threePiece;
  if (name.includes("salwar")) return LOCAL_PRODUCT_IMAGES.threePiece;
  if (name.includes("kameez")) return LOCAL_PRODUCT_IMAGES.threePiece;
  if (name.includes("casual printed top")) return LOCAL_PRODUCT_IMAGES.printedTop;
  if (name.includes("designer two piece set")) return LOCAL_PRODUCT_IMAGES.twoPiece;
  if (name.includes("pack of 6 cotton socks")) return LOCAL_PRODUCT_IMAGES.socks;
  if (name.includes("cotton socks")) return LOCAL_PRODUCT_IMAGES.socks;
  if (name.includes("classic analog watch")) return LOCAL_PRODUCT_IMAGES.watch;
  if (name.includes("elegant women's watch")) return LOCAL_PRODUCT_IMAGES.elegantWomensWatch;
  if (name.includes("crystal dial women's watch")) return LOCAL_PRODUCT_IMAGES.crystalWatch;
  if (name.includes("premium men's perfume")) return LOCAL_PRODUCT_IMAGES.mensPerfume;
  if (name.includes("luxury rose perfume")) return LOCAL_PRODUCT_IMAGES.perfume;
  if (name.includes("iphone 15 pro max")) return LOCAL_PRODUCT_IMAGES.smartphone;
  if (name.includes("wireless mouse")) return LOCAL_PRODUCT_IMAGES.mouse;
  if (name.includes("minimal graphic t-shirt")) return LOCAL_PRODUCT_IMAGES.minimalGraphicTee;
  if (name.includes("classic denim jeans")) return LOCAL_PRODUCT_IMAGES.jeans;
  if (name.includes("festival embroidered panjabi")) return LOCAL_PRODUCT_IMAGES.festivalPanjabi;
  if (name.includes("comfort pajama bottom")) return LOCAL_PRODUCT_IMAGES.pajamaBottom;
  if (name.includes("elegant heel sandal")) return LOCAL_PRODUCT_IMAGES.heel;
  if (name.includes("daily comfort sandal")) return LOCAL_PRODUCT_IMAGES.sandal;
  if (name.includes("loafer")) return LOCAL_PRODUCT_IMAGES.mensLoafer;
  if (name.includes("men's sandal") || name.includes("mens sandal")) return LOCAL_PRODUCT_IMAGES.mensSandal;
  if (name.includes("sneaker")) return LOCAL_PRODUCT_IMAGES.mensSneaker;
  if (name.includes("wireless noise-cancel headphones")) return LOCAL_PRODUCT_IMAGES.headphones;
  if (name.includes("pocket bluetooth earbuds")) return LOCAL_PRODUCT_IMAGES.earbuds;
  if (name.includes("fast charge adapter 33w")) return LOCAL_PRODUCT_IMAGES.charger;
  if (name.includes("slim power bank 10000mah")) return LOCAL_PRODUCT_IMAGES.powerbank;

  if (categorySlug.includes("mens-loafers") || categoryName.includes("loafer")) return LOCAL_PRODUCT_IMAGES.mensLoafer;
  if (categorySlug.includes("mens-sandals")) return LOCAL_PRODUCT_IMAGES.mensSandal;
  if (categorySlug.includes("mens-other-shoes") || categorySlug.includes("mens-sneakers")) return LOCAL_PRODUCT_IMAGES.mensSneaker;
  if (categorySlug.includes("womens-heels")) return LOCAL_PRODUCT_IMAGES.heel;
  if (categorySlug.includes("womens-sandals")) return LOCAL_PRODUCT_IMAGES.sandal;
  if (categorySlug.includes("womens-three-piece")) return LOCAL_PRODUCT_IMAGES.threePiece;
  if (categorySlug.includes("mens-socks") || categorySlug.includes("womens-socks")) return LOCAL_PRODUCT_IMAGES.socks;
  if (categorySlug.includes("womens-watches")) return LOCAL_PRODUCT_IMAGES.womensWatch;
  if (categorySlug.includes("womens-perfumes")) return LOCAL_PRODUCT_IMAGES.perfume;
  if (categorySlug.includes("electronics-headphones")) return LOCAL_PRODUCT_IMAGES.headphones;
  if (categorySlug.includes("electronics-earbuds")) return LOCAL_PRODUCT_IMAGES.earbuds;
  if (categorySlug.includes("electronics-chargers")) return LOCAL_PRODUCT_IMAGES.charger;
  if (categorySlug.includes("electronics-powerbanks")) return LOCAL_PRODUCT_IMAGES.powerbank;
  if (categorySlug.includes("electronics-mobiles")) return LOCAL_PRODUCT_IMAGES.smartphone;
  if (categorySlug.includes("electronics-mouse")) return LOCAL_PRODUCT_IMAGES.mouse;
  if (categorySlug.includes("baby-clothes")) return LOCAL_PRODUCT_IMAGES.kidswear;

  if (lower.includes("onesie")) return LOCAL_PRODUCT_IMAGES.onesie;
  if (lower.includes("romper")) return LOCAL_PRODUCT_IMAGES.romper;
  if (lower.includes("winter jacket")) return LOCAL_PRODUCT_IMAGES.kidsJacket;
  if (lower.includes("flannel")) return LOCAL_PRODUCT_IMAGES.flannelShirt;
  if (lower.includes("classic shirt")) return LOCAL_PRODUCT_IMAGES.classicShirt;
  if (lower.includes("panjabi") || lower.includes("kurta")) {
    return LOCAL_PRODUCT_IMAGES.panjabi;
  }
  if (lower.includes("t-shirt") || lower.includes("tee")) {
    return LOCAL_PRODUCT_IMAGES.tshirt;
  }
  if (lower.includes("jeans") || lower.includes("denim")) {
    return LOCAL_PRODUCT_IMAGES.jeans;
  }
  if (lower.includes("chinos")) return LOCAL_PRODUCT_IMAGES.chinos;
  if (lower.includes("dress pants")) return LOCAL_PRODUCT_IMAGES.dressPants;
  if (lower.includes("shorts")) return LOCAL_PRODUCT_IMAGES.shorts;
  if (lower.includes("kurti")) return LOCAL_PRODUCT_IMAGES.kurti;
  if (lower.includes("three piece") || lower.includes("3 piece") || lower.includes("salwar") || lower.includes("kameez")) {
    return LOCAL_PRODUCT_IMAGES.threePiece;
  }
  if (lower.includes("printed top")) return LOCAL_PRODUCT_IMAGES.printedTop;
  if (lower.includes("two-piece")) return LOCAL_PRODUCT_IMAGES.twoPiece;
  if (lower.includes("sock")) return LOCAL_PRODUCT_IMAGES.socks;
  if (lower.includes("watch")) {
    if (lower.includes("women")) return LOCAL_PRODUCT_IMAGES.womensWatch;
    return LOCAL_PRODUCT_IMAGES.watch;
  }
  if (lower.includes("perfume") || lower.includes("fragrance")) {
    if (lower.includes("men")) return LOCAL_PRODUCT_IMAGES.mensPerfume;
    return LOCAL_PRODUCT_IMAGES.perfume;
  }
  if (lower.includes("headphones")) {
    return LOCAL_PRODUCT_IMAGES.headphones;
  }
  if (lower.includes("earbuds")) {
    return LOCAL_PRODUCT_IMAGES.earbuds;
  }
  if (lower.includes("charger") || lower.includes("cable")) {
    return LOCAL_PRODUCT_IMAGES.charger;
  }
  if (lower.includes("power bank")) return LOCAL_PRODUCT_IMAGES.powerbank;
  if (lower.includes("mouse")) return LOCAL_PRODUCT_IMAGES.mouse;
  if (lower.includes("iphone") || lower.includes("phone") || lower.includes("smartphone")) return LOCAL_PRODUCT_IMAGES.smartphone;
  if (lower.includes("mens-shoes") || lower.includes("men's shoes") || lower.includes("loafer")) return LOCAL_PRODUCT_IMAGES.mensLoafer;
  if (lower.includes("mens-sandals")) return LOCAL_PRODUCT_IMAGES.mensSandal;
  if (lower.includes("mens-other-shoes") || lower.includes("sneaker")) return LOCAL_PRODUCT_IMAGES.mensSneaker;
  if (lower.includes("heel")) return LOCAL_PRODUCT_IMAGES.heel;
  if (lower.includes("sandal") || lower.includes("shoe")) {
    return LOCAL_PRODUCT_IMAGES.sandal;
  }
  if (lower.includes("baby") || lower.includes("kids")) {
    return LOCAL_PRODUCT_IMAGES.kidswear;
  }
  if (lower.includes("electronics")) {
    return LOCAL_PRODUCT_IMAGES.headphones;
  }
  if (lower.includes("accessories")) {
    return LOCAL_PRODUCT_IMAGES.watch;
  }
  if (lower.includes("women")) {
    return LOCAL_PRODUCT_IMAGES.sandal;
  }
  if (lower.includes("men")) {
    return LOCAL_PRODUCT_IMAGES.tshirt;
  }

  return "";
}

export function getProductDisplayId(product: Partial<ProductLike> & { id?: string; product_code?: string }) {
  if (product.product_code) return product.product_code;
  if (product.id) return product.id;
  return "Unavailable";
}
