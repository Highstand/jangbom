import type { ReactNode } from "react";

/** 장봄/섹션제목 (787:1528) · 홈은 버튼 있음, 장바구니는 버튼 없음 */
export function SectionTitle({ title, figmaId, action }: { title: string; figmaId: string; action?: ReactNode }) {
  return (
    <div data-figma={figmaId} className="flex w-full shrink-0 items-center justify-between">
      <h2 className="whitespace-nowrap text-body-strong text-text-primary">{title}</h2>
      {action}
    </div>
  );
}

/** 장봄/대체상품제목 (787:1537) */
export function AlternativeTitle({ figmaId }: { figmaId: string }) {
  return (
    <p data-figma={figmaId} className="shrink-0 whitespace-nowrap text-body-small text-text-tertiary">
      대신 이 상품 어때요?
    </p>
  );
}
