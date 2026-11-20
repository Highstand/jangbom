import type { Address, Product } from "./types";

/** 목업 데이터 · Figma 화면(774:1144)에 적힌 값 그대로 */
export const products: Record<string, Product> = {
  "fresh-milk": { id: "fresh-milk", name: "신선한 우유", volume: "1,000mL", price: 2980, arrival: "confirmed", image: "/images/products/fresh-milk.jpg", purchaseCount: 6 },
  egg: { id: "egg", name: "계란", volume: "10구", price: 4990, arrival: "confirmed", image: "/images/products/egg.jpg", purchaseCount: 5 },
  tofu: { id: "tofu", name: "두부", volume: "300g", price: 1890, arrival: "confirmed", image: "/images/products/tofu.jpg", purchaseCount: 4 },
  "organic-milk": { id: "organic-milk", name: "유기농 우유", volume: "900mL", price: 3200, arrival: "unavailable", image: "/images/products/organic-milk.jpg" },
  "low-fat-milk": { id: "low-fat-milk", name: "저지방 우유", volume: "1,000mL", price: 2750, arrival: "confirmed", image: "/images/products/low-fat-milk.jpg", soldOut: true },
  "lactose-free-milk": { id: "lactose-free-milk", name: "락토프리 우유", volume: "1,000mL", price: 2890, arrival: "confirmed", image: "/images/products/lactose-free-milk.jpg" },
};

export const addresses: Address[] = [
  { id: "home", label: "집", street: "서울시 ○○구 ○○로 12", district: "서울시 ○○구", detail: "101동 1001호" },
  { id: "office", label: "회사", street: "서울시 ○○구 ○○대로 34", district: "서울시 ○○구", detail: "8층" },
];

export const delivery = {
  deadline: "23:00",
  arrival: "내일 아침 7시 전",
  remaining: "1시간 32분",
  exception: "일부 상품은 22:00 마감이에요",
  /** 마감이 다른 상품 (유기농 우유) */
  exceptionDeadline: "22:00",
  shipping: 3000,
  paymentMethod: "저장된 카드 · 1234",
};

/** 홈 · 자주 산 상품 */
export const frequent = {
  lastOrder: "11/12 주문 · 3개 · 모두 내일 아침 확정",
  productIds: ["fresh-milk", "egg", "tofu"],
};

/** 검색 결과 · "우유" */
export const search = {
  query: "우유",
  summary: "12개 중 9개 내일 아침 도착",
  productIds: ["fresh-milk", "organic-milk", "low-fat-milk"],
  alternativeId: "lactose-free-milk",
};

/** 장바구니 첫 상태 (4. 장바구니) */
export const initialCart = [
  { id: "organic-milk", qty: 1 },
  { id: "fresh-milk", qty: 1 },
  { id: "tofu", qty: 1 },
  { id: "egg", qty: 1 },
];

/** 불가 상품 → 대체 상품 */
export const alternatives: Record<string, string> = { "organic-milk": "lactose-free-milk" };

export const order = { number: "20261120-0001" };
