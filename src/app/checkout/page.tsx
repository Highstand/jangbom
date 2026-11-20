"use client";

import { ArrivalInfo } from "@/components/ArrivalInfo";
import { BottomContainer } from "@/components/BottomContainer";
import { Button } from "@/components/Button";
import { DeliveryAddress } from "@/components/DeliveryAddress";
import { Header } from "@/components/Header";
import { PriceSummary } from "@/components/PriceSummary";
import { Screen } from "@/components/Screen";
import { SummaryCard } from "@/components/SummaryCard";
import { useAddressSheet } from "@/components/useAddressSheet";
import { delivery } from "@/data/mock";
import { useStore } from "@/data/store";
import { won } from "@/data/types";

/** 5. 결제 (774:1488) · 결제는 목업이라 누르면 주문 완료로 간다 */
export default function CheckoutPage() {
  const { address, deliverable, subtotal } = useStore();
  const { openSheet, sheet } = useAddressSheet();
  const total = subtotal + delivery.shipping;
  const [first, ...rest] = deliverable;
  const items = first ? (rest.length ? `${first.product.name} 외 ${rest.length}개` : first.product.name) : "";

  return (
    <Screen
      header={<Header title="결제" figmaId="774:1489" backHref="/cart" />}
      bottom={
        <BottomContainer figmaId="774:1545">
          <Button href="/complete">{won(total)} 결제하기</Button>
        </BottomContainer>
      }
    >
      <DeliveryAddress figmaId="774:1502" address={address} onChangeAddress={openSheet} />
      <ArrivalInfo figmaId="774:1516" label="도착 시각" arrival={`${delivery.arrival} 도착`} />
      <SummaryCard figmaId="788:1727" label="주문 상품" value={items} />
      <PriceSummary figmaId="774:1528" subtotal={subtotal} shipping={delivery.shipping} paymentMethod={delivery.paymentMethod} />
      {sheet}
    </Screen>
  );
}
