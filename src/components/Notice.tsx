/** 도착 요약 (경고) · 장바구니 빠지는 상품 안내 */
export function Notice({ figmaId, lines }: { figmaId: string; lines: string[] }) {
  return (
    <div data-figma={figmaId} className="flex w-full shrink-0 rounded-card bg-bg-warning-subtle px-16 py-12">
      <div className="min-w-0 flex-1 text-body-small text-text-warning">
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
    </div>
  );
}
