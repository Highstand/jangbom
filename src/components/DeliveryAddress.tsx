import type { Address } from "@/data/types";
import { Button } from "./Button";
import { Card } from "./Card";
import { ListRow } from "./ListRow";

/** 장봄/배송주소 (484:1167) · 결제 화면 배송지 카드 */
export function DeliveryAddress({ figmaId, address, onChangeAddress }: { figmaId: string; address: Address; onChangeAddress: () => void }) {
  return (
    <Card figmaId={figmaId} outlined>
      <div className="flex w-full items-center gap-inline-md">
        <h2 className="min-w-0 flex-1 text-body-strong text-text-primary">배송지</h2>
        <Button variant="secondary" onClick={onChangeAddress}>
          주소 바꾸기
        </Button>
      </div>
      <ListRow label={address.label} value={address.street} />
      <ListRow label="상세 주소" value={address.detail} />
    </Card>
  );
}
