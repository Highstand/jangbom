import type { Address } from "./types";

/**
 * 아직 Supabase 테이블이 없는 값만 남긴 목업 · Figma 화면(774:1144)에 적힌 값 그대로.
 * 상품 · 자주 사는 상품은 Supabase products · favorites (src/data/catalog.ts),
 * 주문은 Supabase orders (src/data/orders.ts).
 */

export const addresses: Address[] = [
  { id: "home", label: "집", street: "서울시 ○○구 ○○로 12", district: "서울시 ○○구", detail: "101동 1001호" },
  { id: "office", label: "회사", street: "서울시 ○○구 ○○대로 34", district: "서울시 ○○구", detail: "8층" },
];

export const delivery = {
  deadline: "23:00",
  arrival: "내일 아침 7시 전",
  remaining: "1시간 32분",
  shipping: 3000,
  paymentMethod: "저장된 카드 · 1234",
};

/** 홈 · 자주 산 상품 위 지난 주문 날짜 (orders 읽기를 막아 두어 목업) */
export const lastOrderDate = "11/12";

/** 검색 · 처음 검색어는 Figma 화면(3. 검색 결과)과 같은 "우유" */
export const search = { query: "우유" };

/** 장바구니 첫 상태 (4. 장바구니) · 상품 정보는 products에서 채운다 */
export const initialCart = [
  { id: "organic-milk", qty: 1 },
  { id: "fresh-milk", qty: 1 },
  { id: "tofu", qty: 1 },
  { id: "egg", qty: 1 },
];
