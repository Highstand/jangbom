import type { Arrival } from "@/data/types";

/** 장봄/도착배지 State · Excluded는 v3 (장바구니에서 이번 주문에 안 들어가는 상품, 문구 고정) */
export type BadgeState = Arrival | "excluded";

const badge: Record<BadgeState, { label: string; className: string }> = {
  confirmed: { label: "내일 아침 확정", className: "bg-bg-subtle text-text-secondary" },
  unavailable: { label: "내일 아침 불가", className: "bg-bg-warning-subtle text-text-warning" },
  excluded: { label: "이번 주문에서 빠짐", className: "bg-bg-warning-subtle text-text-warning" },
};

/** 장봄/도착배지 (787:1425) · 같은 상품은 어느 화면에서나 같은 상태 · 장바구니의 불가 상품만 Excluded */
export function ArrivalBadge({ state }: { state: BadgeState }) {
  const { label, className } = badge[state];
  return (
    <span data-component="arrival-badge" className={`shrink-0 whitespace-nowrap rounded-pill px-inline-md py-inline-sm text-caption ${className}`}>
      {label}
    </span>
  );
}

/** 품절 배지 (484:1118) */
export function SoldOutBadge() {
  return <span className="shrink-0 whitespace-nowrap rounded-pill bg-bg-error-subtle px-8 py-4 text-caption text-text-error">품절</span>;
}
