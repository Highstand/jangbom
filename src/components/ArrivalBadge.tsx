import type { Arrival } from "@/data/types";

/** 장봄/도착배지 (787:1425) · 같은 상품은 어느 화면에서나 같은 상태 */
export function ArrivalBadge({ arrival }: { arrival: Arrival }) {
  const unavailable = arrival === "unavailable";
  return (
    <span
      data-component="arrival-badge"
      className={`shrink-0 whitespace-nowrap rounded-pill px-inline-md py-inline-sm text-caption ${
        unavailable ? "bg-bg-warning-subtle text-text-warning" : "bg-bg-subtle text-text-secondary"
      }`}
    >
      {unavailable ? "내일 아침 불가" : "내일 아침 확정"}
    </span>
  );
}

/** 품절 배지 (484:1118) */
export function SoldOutBadge() {
  return <span className="shrink-0 whitespace-nowrap rounded-pill bg-bg-error-subtle px-8 py-4 text-caption text-text-error">품절</span>;
}
