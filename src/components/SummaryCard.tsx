import { Card } from "./Card";
import { ListRow } from "./ListRow";

/** 장봄/요약카드 (787:1543) · 장바구니 "빠지는 상품", 결제 "주문 상품" 한 줄 요약 */
export function SummaryCard({ figmaId, label, value }: { figmaId?: string; label: string; value: string }) {
  return (
    <Card figmaId={figmaId} gap="0">
      <ListRow label={label} value={value} />
    </Card>
  );
}
