"use client";

import { BottomContainer } from "@/components/BottomContainer";
import { Button } from "@/components/Button";
import { DeadlineBanner } from "@/components/DeadlineBanner";
import { Header } from "@/components/Header";
import { ProductAction } from "@/components/ProductAction";
import { ProductCard } from "@/components/ProductCard";
import { Screen } from "@/components/Screen";
import { SearchInput } from "@/components/SearchInput";
import { SectionTitle } from "@/components/SectionTitle";
import { useAddressSheet } from "@/components/useAddressSheet";
import { delivery, frequent, products } from "@/data/mock";
import { useStore } from "@/data/store";

const cardIds: Record<string, string> = { "fresh-milk": "788:1426", egg: "788:1438", tofu: "788:1450" };

/** 1. 홈 (774:1145) */
export default function HomePage() {
  const { address, deliverableCount, unavailable } = useStore();
  const { openSheet, sheet } = useAddressSheet();

  return (
    <Screen
      header={<Header title="장봄" figmaId="774:1146" cartCount={deliverableCount} />}
      bottom={
        <BottomContainer figmaId="774:1222">
          <Button href="/cart">장바구니 {deliverableCount}개 보기</Button>
        </BottomContainer>
      }
    >
      <DeadlineBanner
        figmaId="774:1159"
        deadline={delivery.deadline}
        arrival={delivery.arrival}
        remaining={delivery.remaining}
        exception={unavailable.length > 0 ? delivery.exception : undefined}
        region={`${address.label} · ${address.district}`}
        onChangeAddress={openSheet}
      />
      <SearchInput figmaId="774:1169" placeholder="어떤 품목을 찾으세요?" href="/search" />
      <SectionTitle
        figmaId="788:1699"
        title="자주 산 상품"
        action={
          <Button variant="text" href="/cart" chevron>
            지난번 주문 그대로 담기
          </Button>
        }
      />
      <p data-figma="782:1336" className="w-full text-caption text-text-tertiary">
        {frequent.lastOrder}
      </p>
      {frequent.productIds.map((id) => {
        const p = products[id];
        return (
          <ProductCard
            key={id}
            figmaId={cardIds[id]}
            product={p}
            details={`${p.volume} · ${p.purchaseCount}번 샀어요`}
            action={<ProductAction product={p} />}
          />
        );
      })}
      {sheet}
    </Screen>
  );
}
