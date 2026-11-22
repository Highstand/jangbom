import { Card } from "./Card";
import { ListRow } from "./ListRow";

type SummaryCardProps = {
  figmaId?: string;
  label: string;
  value: string;
  /** ShowExcluded (v3 · 기본 꺼짐) · 결제에서 빠진 상품이 있을 때만 "빠진 상품" 줄을 더한다 */
  excluded?: string;
};

/** 장봄/요약카드 (787:1543) · 장바구니 "빠지는 상품", 결제 "주문 상품" 한 줄 요약 */
export function SummaryCard({ figmaId, label, value, excluded }: SummaryCardProps) {
  return (
    <Card figmaId={figmaId} gap={excluded ? "8" : "0"}>
      <ListRow label={label} value={value} />
      {excluded && <ListRow label="빠진 상품" value={excluded} />}
    </Card>
  );
}
