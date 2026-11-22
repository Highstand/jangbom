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
 * 5. 결제 (v3 1364:11857) · 결제 자체는 목업이다(실제 결제·PG 없음).
 * 결제하기를 누르면 Supabase orders에 한 줄 저장하고, 저장이 끝나면 주문 완료로 간다.
 * 저장하는 동안은 버튼을 막아 같은 주문이 두 번 들어가지 않게 한다.
 * v3: 결제는 장바구니 최종 상태를 그대로 받는다 · 상품 수·금액·버튼 문구가 장바구니 결제하기 버튼과 같다.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { address, deliverable, unavailable, deliverableCount, subtotal, placeOrder } = useStore();
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
  const names = first ? (rest.length ? `${first.product.name} 외 ${rest.length}개` : first.product.name) : "";
  const items = `${names} · ${deliverableCount}개`;
  // ShowExcluded · 장바구니에 불가 상품이 남아 있을 때만
  const excluded = unavailable.length ? `${unavailable.map((u) => u.product.name).join(", ")} · 결제 안 해요` : undefined;

  return (
    <Screen
      header={<Header title="결제" figmaId="1364:11858" backHref="/cart" />}
      bottom={
        <BottomContainer figmaId="1364:11864">
          <Button onClick={pay} disabled={saving}>
            {deliverableCount}개 {won(total)} 결제하기
          </Button>
        </BottomContainer>
      }
    >
      <DeliveryAddress figmaId="1364:11860" address={address} onChangeAddress={openSheet} />
      <ArrivalInfo figmaId="1364:11861" label="도착 시각" arrival={`${delivery.arrival} 도착`} />
      <SummaryCard figmaId="1364:11862" label="주문 상품" value={items} excluded={excluded} />
      <PriceSummary figmaId="1364:11863" subtotal={subtotal} shipping={delivery.shipping} paymentMethod={delivery.paymentMethod} />
      {sheet}
    </Screen>
  );
}
