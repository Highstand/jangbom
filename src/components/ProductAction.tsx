"use client";

import { useStore } from "@/data/store";
import type { Product } from "@/data/types";
import { SoldOutBadge } from "./ArrivalBadge";
import { Button } from "./Button";
import { QuantityStepper } from "./QuantityStepper";

/** 홈·검색 상품 카드의 오른쪽 행동 · 담기 → 담기면 수량조절 · 불가면 담기 비활성 · 품절 배지 */
export function ProductAction({ product }: { product: Product }) {
  const { qtyOf, add, setQty } = useStore();
  if (product.soldOut) return <SoldOutBadge />;
  if (product.arrival === "unavailable") {
    return (
      <Button variant="secondary" disabled>
        담기
      </Button>
    );
  }
  const qty = qtyOf(product.id);
  if (qty > 0) return <QuantityStepper name={product.name} quantity={qty} onChange={(n) => setQty(product.id, n)} />;
  return (
    <Button variant="secondary" onClick={() => add(product.id)}>
      담기
    </Button>
  );
}
