import type { ReactNode } from "react";

/** BottomContainer (키트 208:153) · 화면 아래 고정 버튼 영역, 안에 Primary 버튼 1개 */
export function BottomContainer({ children, figmaId, sticky = true }: { children: ReactNode; figmaId?: string; sticky?: boolean }) {
  return (
    <div
      data-figma={figmaId}
      className={`${sticky ? "sticky bottom-0" : ""} flex w-full shrink-0 flex-col border-t border-border-subtle bg-bg-card px-20 pt-12 pb-28`}
    >
      {children}
    </div>
  );
}
