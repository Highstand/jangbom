export type Arrival = "confirmed" | "unavailable";

export type Product = {
  id: string;
  name: string;
  volume: string;
  price: number;
  arrival: Arrival;
  image: string;
  soldOut?: boolean;
  /** 홈 자주 산 상품의 구매 횟수 */
  purchaseCount?: number;
};

export type Address = {
  id: string;
  label: string;
  street: string;
  district: string;
  detail: string;
};

export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
