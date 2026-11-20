/** 장봄/상품항목 (787:1519) · 대체 상품으로 바꾼 뒤 "○○를 뺐어요 · 되돌리기" */
export function RemovedItem({ figmaId, name, onUndo }: { figmaId: string; name: string; onUndo: () => void }) {
  return (
    <section data-figma={figmaId} className="flex w-full shrink-0 flex-col rounded-card bg-bg-card p-stack-md">
      <div className="flex w-full items-center gap-inline-md">
        <p className="min-w-0 flex-1 text-body-small text-text-tertiary">{name}를 뺐어요</p>
        <button type="button" onClick={onUndo} className="flex h-32 shrink-0 items-center justify-center gap-inline-sm rounded-button text-body-small text-text-secondary">
          되돌리기
        </button>
      </div>
    </section>
  );
}
