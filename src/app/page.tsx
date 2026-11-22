"use client";

import { BottomContainer } from "@/components/BottomContainer";
import { Button } from "@/components/Button";
import { DeadlineBanner } from "@/components/DeadlineBanner";
import { DeliveryRegionRow } from "@/components/DeliveryRegionRow";
import { Header } from "@/components/Header";
import { ProductAction } from "@/components/ProductAction";
import { ProductCard } from "@/components/ProductCard";
import { Screen } from "@/components/Screen";
import { SearchInput } from "@/components/SearchInput";
import { SectionTitle } from "@/components/SectionTitle";
import { useAddressSheet } from "@/components/useAddressSheet";
import { delivery, lastOrderDate } from "@/data/mock";
import { useStore } from "@/data/store";

const cardIds: Record<string, string> = { "fresh-milk": "1364:11795", egg: "1364:11796", tofu: "1364:11797" };

/** 1. 홈 (v3 1364:11788) · 배너에는 예외 줄만, 주소는 배너 아래 받는 곳 행(Type=Row) · 자주 산 상품은 Supabase favorites + products */
export default function HomePage() {
  const { address, deliverableCount, bannerException, favorites } = useStore();
  const { openSheet, sheet } = useAddressSheet();
  const allConfirmed = favorites.every(({ product }) => product.arrival === "confirmed" && !product.soldOut);

  return (
    <Screen
      header={<Header title="장봄" figmaId="1364:11789" cartCount={deliverableCount} />}
      bottom={
        <BottomContainer figmaId="1364:11798">
          <Button href="/cart">장바구니 {deliverableCount}개 보기</Button>
        </BottomContainer>
      }
    >
      <DeadlineBanner
        figmaId="1364:11791"
        deadline={delivery.deadline}
        arrival={delivery.arrival}
        remaining={delivery.remaining}
        exception={bannerException}
      />
      <DeliveryRegionRow figmaId="1380:2042" address={`${address.label} · ${address.district}`} onChangeAddress={openSheet} />
      <SearchInput figmaId="1364:11792" placeholder="어떤 품목을 찾으세요?" href="/search" />
      <SectionTitle
        figmaId="1364:11793"
        title="자주 산 상품"
        action={
          <Button variant="text" href="/cart" chevron>
            지난번 주문 그대로 담기
          </Button>
        }
      />
      <p data-figma="1364:11794" className="w-full text-caption text-text-tertiary">
        {lastOrderDate} 주문 · {favorites.length}개{allConfirmed ? " · 모두 내일 아침 확정" : ""}
      </p>
      {favorites.map(({ product: p, purchaseCount }) => (
        <ProductCard
          key={p.id}
          figmaId={cardIds[p.id]}
          product={p}
          details={`${p.volume} · ${purchaseCount}번 샀어요`}
          action={<ProductAction product={p} />}
        />
      ))}
      {sheet}
    </Screen>
  );
}
