"use client";

import { BottomContainer } from "@/components/BottomContainer";
import { Button } from "@/components/Button";
import { DeadlineBanner } from "@/components/DeadlineBanner";
import { Header } from "@/components/Header";
import { Notice } from "@/components/Notice";
import { PriceSummary } from "@/components/PriceSummary";
import { ProductCard } from "@/components/ProductCard";
import { QuantityStepper } from "@/components/QuantityStepper";
import { RemovedItem } from "@/components/RemovedItem";
import { Screen } from "@/components/Screen";
import { SearchInput } from "@/components/SearchInput";
import { AlternativeTitle, SectionTitle } from "@/components/SectionTitle";
import { SummaryCard } from "@/components/SummaryCard";
import { useAddressSheet } from "@/components/useAddressSheet";
import { alternatives, delivery, products } from "@/data/mock";
import { useStore } from "@/data/store";
import { won } from "@/data/types";

/** Figma 노드 · 4. 장바구니(774:1337)와 4-1. 바꾼 뒤(782:1341)는 같은 요소라도 id가 다르다 */
const ids = {
  before: {
    header: "774:1338",
    banner: "774:1351",
    section: "788:1705",
    input: "774:1466",
    summary: "774:1471",
    bottom: "774:1485",
    cards: { "organic-milk": "788:1515", "lactose-free-milk": "788:1530", "fresh-milk": "788:1542", tofu: "788:1564", egg: "788:1585" } as Record<string, string>,
  },
  after: {
    header: "782:1342",
    banner: "782:1344",
    section: "788:1711",
    input: "782:1417",
    summary: "782:1420",
    bottom: "782:1421",
    cards: { "lactose-free-milk": "788:1615", "fresh-milk": "788:1636", tofu: "788:1657", egg: "788:1678" } as Record<string, string>,
  },
};

/** 4. 장바구니 · 4-1. 대체 상품으로 바꾼 뒤 */
export default function CartPage() {
  const { address, lines, deliverable, unavailable, deliverableCount, subtotal, swapped, swap, undoSwap, setQty, remove } = useStore();
  const { openSheet, sheet } = useAddressSheet();
  const id = swapped ? ids.after : ids.before;
  const total = subtotal + delivery.shipping;
  const inCart = new Set(lines.map((l) => l.id));
  const alternative = unavailable.map((u) => ({ from: u.product, to: products[alternatives[u.product.id]] })).find((a) => a.to && !inCart.has(a.to.id));

  return (
    <Screen
      header={<Header title="장바구니" figmaId={id.header} backHref="/" cartCount={lines.reduce((n, l) => n + l.qty, 0)} />}
      bottom={
        <BottomContainer figmaId={id.bottom}>
          <Button href="/checkout">
            {deliverableCount}개 {won(total)} 결제하기
          </Button>
        </BottomContainer>
      }
    >
      <DeadlineBanner
        figmaId={id.banner}
        deadline={delivery.deadline}
        arrival={delivery.arrival}
        remaining={delivery.remaining}
        exception={unavailable.length > 0 ? delivery.exception : undefined}
        region={`${address.label} · ${address.district}`}
        onChangeAddress={openSheet}
      />
      {unavailable.map(({ product, qty }) => (
        <Notice
          key={`notice-${product.id}`}
          figmaId="774:1361"
          lines={[`${product.name} ${qty}개는 이번 주문에서 빠져요`, `이 상품만 ${delivery.exceptionDeadline} 마감이 지났어요`]}
        />
      ))}
      {unavailable.map(({ product }) => (
        <ProductCard
          key={product.id}
          figmaId={id.cards[product.id]}
          product={product}
          action={
            <Button variant="text" onClick={() => remove(product.id)}>
              삭제
            </Button>
          }
        />
      ))}
      {alternative && (
        <>
          <AlternativeTitle figmaId="788:1719" />
          <ProductCard
            figmaId={id.cards[alternative.to.id]}
            product={alternative.to}
            action={
              <Button variant="secondary" onClick={() => swap(alternative.from.id)}>
                이걸로 바꾸기
              </Button>
            }
          />
        </>
      )}
      {swapped && <RemovedItem figmaId="788:1606" name={products[swapped.from].name} onUndo={undoSwap} />}
      <SectionTitle figmaId={id.section} title={`내일 아침 도착 ${deliverableCount}개`} />
      {deliverable.map(({ product, qty }) => (
        <ProductCard
          key={product.id}
          figmaId={id.cards[product.id]}
          product={product}
          action={
            <div className="flex shrink-0 flex-col items-end gap-4">
              <QuantityStepper name={product.name} quantity={qty} onChange={(n) => setQty(product.id, n)} />
              <Button variant="text" onClick={() => remove(product.id)}>
                삭제
              </Button>
            </div>
          }
        />
      ))}
      <SearchInput figmaId={id.input} placeholder="다음 품목 검색" href="/search" />
      {unavailable.map(({ product, qty }) => (
        <SummaryCard key={`out-${product.id}`} figmaId="788:1723" label="빠지는 상품" value={`${product.name} ${won(product.price * qty)}`} />
      ))}
      <PriceSummary figmaId={id.summary} subtotal={subtotal} shipping={delivery.shipping} />
      {sheet}
    </Screen>
  );
}
