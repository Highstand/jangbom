import { won } from "@/data/types";
import { Card } from "./Card";
import { Divider, ListRow } from "./ListRow";

type PriceSummaryProps = {
  figmaId: string;
  subtotal: number;
  shipping: number;
  /** 결제 화면: 결제 금액을 크게, 결제 수단 줄을 더한다 */
  paymentMethod?: string;
};

/** 장봄/금액요약 (484:1229 장바구니 · 484:1244 결제) */
export function PriceSummary({ figmaId, subtotal, shipping, paymentMethod }: PriceSummaryProps) {
  const total = subtotal + shipping;
  return (
    <Card figmaId={figmaId} outlined>
      <ListRow label="상품 금액" value={won(subtotal)} />
      <ListRow label="배송비" value={won(shipping)} />
      <Divider />
      {paymentMethod ? (
        <>
          <ListRow label="결제 금액" value={won(total)} valueClassName="text-h1 text-text-accent" />
          <ListRow label="결제 수단" value={paymentMethod} />
        </>
      ) : (
        <ListRow label="합계" value={won(total)} />
      )}
    </Card>
  );
}
