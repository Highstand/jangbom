/** Chip (키트 210:121) · 하나만 고르는 칩 */
export function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      // 폭이 내용으로 정해지는 칩은 Figma에서 테두리 두께가 폭에 들어간다 → inset-ring이 아니라 실제 border
      className={`flex h-32 shrink-0 items-center justify-center rounded-pill border px-14 ${
        selected
          ? "border-fill-secondary bg-fill-secondary text-body-small-strong text-text-on-primary"
          : "border-border-default bg-bg-card text-body-small text-text-primary"
      }`}
    >
      {label}
    </button>
  );
}
