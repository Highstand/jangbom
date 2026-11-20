import type { ReactNode } from "react";

/** ListRow (키트 225:267) · 라벨(회색)–값(검정) 한 줄 */
export function ListRow({ label, value, valueClassName }: { label: string; value: ReactNode; valueClassName?: string }) {
  return (
    <div className="flex w-full items-center">
      <span className="min-w-0 flex-1 text-body-small text-text-tertiary">{label}</span>
      <span className={`shrink-0 whitespace-nowrap ${valueClassName ?? "text-body-small-strong text-text-primary"}`}>{value}</span>
    </div>
  );
}

/** Divider (키트 225:265) · 카드 안 항목 구분 */
export function Divider() {
  return <div className="h-px w-full shrink-0 bg-border-divider" />;
}
