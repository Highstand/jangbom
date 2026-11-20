import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  figmaId?: string;
  /** 테두리(border/subtle)가 있는 카드 · Figma처럼 안쪽 여백 위에 겹쳐 높이를 늘리지 않는다 */
  outlined?: boolean;
  gap?: "0" | "8" | "12";
  className?: string;
};

const gaps = { "0": "gap-0", "8": "gap-stack-sm", "12": "gap-12" };

/** Card (키트 225:263) · 회색 페이지 배경 위의 흰 카드 */
export function Card({ children, figmaId, outlined, gap = "12", className = "" }: CardProps) {
  return (
    <section
      data-figma={figmaId}
      className={`flex w-full shrink-0 flex-col ${gaps[gap]} rounded-card bg-bg-card p-16 ${outlined ? "inset-ring inset-ring-border-subtle" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
