import { cacheLife } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { Catalog, Product } from "./types";

type ProductRow = {
  id: string;
  name: string;
  volume: string;
  price: number;
  image: string;
  arrival: "confirmed" | "unavailable";
  sold_out: boolean;
  cutoff: string | null;
  substitute_id: string | null;
};

type FavoriteRow = { product_id: string; purchase_count: number };

/**
 * 상품(products)과 자주 사는 상품(favorites)을 서버에서 한 번 불러온다.
 * 루트 레이아웃이 불러 StoreProvider에 넘기므로 화면이 처음부터 데이터를 갖고 그려진다.
 * 상품은 자주 바뀌지 않아 몇 분 캐시한다 (Next 16 Cache Components · `use cache`).
 */
export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheLife("minutes");

  const db = supabase();
  const [products, favorites] = await Promise.all([
    db.from("products").select("id, name, volume, price, image, arrival, sold_out, cutoff, substitute_id").order("sort_order"),
    db.from("favorites").select("product_id, purchase_count").order("sort_order"),
  ]);
  if (products.error) throw new Error(`products를 불러오지 못했어요: ${products.error.message}`);
  if (favorites.error) throw new Error(`favorites를 불러오지 못했어요: ${favorites.error.message}`);

  const byId: Record<string, Product> = {};
  for (const r of products.data as ProductRow[]) {
    byId[r.id] = {
      id: r.id,
      name: r.name,
      volume: r.volume,
      price: r.price,
      image: r.image,
      arrival: r.arrival,
      soldOut: r.sold_out || undefined,
      cutoff: r.cutoff ?? undefined,
      substituteId: r.substitute_id ?? undefined,
    };
  }

  return {
    products: byId,
    favorites: (favorites.data as FavoriteRow[])
      .filter((f) => byId[f.product_id])
      .map((f) => ({ productId: f.product_id, purchaseCount: f.purchase_count })),
  };
}
