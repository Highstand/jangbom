"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

/**
 * 5. 결제 (774:1488) · 결제 자체는 목업이다(실제 결제·PG 없음).
 * 결제하기를 누르면 Supabase orders에 한 줄 저장하고, 저장이 끝나면 주문 완료로 간다.
 * 저장하는 동안은 버튼을 막아 같은 주문이 두 번 들어가지 않게 한다.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { address, deliverable, subtotal, placeOrder } = useStore();
  const { openSheet, sheet } = useAddressSheet();
  const [saving, setSaving] = useState(false);

  async function pay() {
    if (saving || deliverable.length === 0) return;
    setSaving(true);
    try {
      await placeOrder();
      router.push("/complete");
    } catch (e) {
      // 오류 화면은 이번 범위 밖 (CLAUDE.md 1장) · 장바구니를 그대로 두고 다시 누를 수 있게 한다
      console.error(e);
      setSaving(false);
    }
  }
  const total = subtotal + delivery.shipping;
  const [first, ...rest] = deliverable;
  const items = first ? (rest.length ? `${first.product.name} 외 ${rest.length}개` : first.product.name) : "";

  return (
    <Screen
      header={<Header title="결제" figmaId="774:1489" backHref="/cart" />}
      bottom={
        <BottomContainer figmaId="774:1545">
          <Button onClick={pay} disabled={saving}>
            {won(total)} 결제하기
          </Button>
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
