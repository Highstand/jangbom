export type Arrival = "confirmed" | "unavailable";

export type Product = {
  id: string;
  name: string;
  volume: string;
  price: number;
  arrival: Arrival;
  image: string;
  soldOut?: boolean;
  /** 이 상품만 다른 마감 시각 (예: 22:00) */
  cutoff?: string;
  /** 불가·품절일 때 제안하는 대체 상품 id */
  substituteId?: string;
};

/** Supabase에서 불러온 상품 · 자주 사는 상품 (src/data/catalog.ts) */
export type Catalog = {
  products: Record<string, Product>;
  favorites: { productId: string; purchaseCount: number }[];
};

/** orders에 저장한 주문 (주문 완료 화면이 보여 줌) */
export type PlacedOrder = {
  number: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
  subtotal: number;
  shippingFee: number;
  addressLabel: string;
  address: string;
  arrivalText: string;
};

export type Address = {
  id: string;
  label: string;
  street: string;
  district: string;
  detail: string;
};

export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
