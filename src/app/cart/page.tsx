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
import { delivery } from "@/data/mock";
import { useStore } from "@/data/store";
import { won } from "@/data/types";

/** Figma 노드 (v3 1364:11787) · 4. 장바구니(1364:11823)와 4-1. 바꾼 뒤(1364:11840)는 같은 요소라도 id가 다르다 */
const ids = {
  before: {
    header: "1364:11824",
    banner: "1364:11826",
    section: "1364:11832",
    input: "1364:11836",
    summary: "1364:11838",
    bottom: "1364:11839",
    cards: { "organic-milk": "1364:11829", "lactose-free-milk": "1364:11831", "fresh-milk": "1364:11833", tofu: "1364:11834", egg: "1364:11835" } as Record<string, string>,
  },
  after: {
    header: "1364:11841",
    banner: "1364:11843",
    section: "1364:11848",
    input: "1364:11853",
    summary: "1364:11855",
    bottom: "1364:11856",
    cards: { "lactose-free-milk": "1364:11849", "fresh-milk": "1364:11850", tofu: "1364:11851", egg: "1364:11852" } as Record<string, string>,
  },
};

/** 4. 장바구니 · 4-1. 대체 상품으로 바꾼 뒤 */
export default function CartPage() {
  const { products, address, lines, deliverable, unavailable, deliverableCount, subtotal, swapped, swap, undoSwap, setQty, remove } = useStore();
  const { openSheet, sheet } = useAddressSheet();
  const id = swapped ? ids.after : ids.before;
  const total = subtotal + delivery.shipping;
  const inCart = new Set(lines.map((l) => l.id));
  const cartCount = lines.reduce((n, l) => n + l.qty, 0);
  const excludedCount = unavailable.reduce((n, l) => n + l.qty, 0);
  // 불가 상품의 대체 상품은 Supabase products.substitute_id
  const alternative = unavailable
    .flatMap((u) => {
      const to = u.product.substituteId ? products[u.product.substituteId] : undefined;
      return to && !inCart.has(to.id) ? [{ from: u.product, to }] : [];
    })
    .at(0);

  return (
    <Screen
      header={<Header title="장바구니" figmaId={id.header} backHref="/" cartCount={cartCount} />}
      bottom={
        <BottomContainer figmaId={id.bottom}>
          <Button href="/checkout">
            {deliverableCount}개 {won(total)} 결제하기
          </Button>
        </BottomContainer>
      }
    >
      {/* v3: 배너 예외 줄(ShowException)은 끄고, 빠지는 상품 안내는 경고 박스 한 곳에서만 한다 */}
      <DeadlineBanner
        figmaId={id.banner}
        deadline={delivery.deadline}
        arrival={delivery.arrival}
        remaining={delivery.remaining}
        region={`${address.label} · ${address.district}`}
        onChangeAddress={openSheet}
      />
      {unavailable.map(({ product, qty }) => (
        <Notice
          key={`notice-${product.id}`}
          figmaId="1364:11827"
          lines={[
            product.cutoff ? `${product.name} ${qty}개는 ${product.cutoff} 마감이 지나` : `${product.name} ${qty}개는 내일 아침 도착이 안 돼`,
            "이번 주문에서 빠져요",
          ]}
        />
      ))}
      {excludedCount > 0 && <SectionTitle figmaId="1380:2050" title={`이번 주문에서 빠지는 상품 ${excludedCount}개`} />}
      {unavailable.map(({ product }) => (
        <ProductCard
          key={product.id}
          figmaId={id.cards[product.id]}
          product={product}
          excluded
          details={`${product.volume} · 결제에 안 들어가요`}
          action={
            <Button variant="text" onClick={() => remove(product.id)}>
              삭제
            </Button>
          }
        />
      ))}
      {alternative && (
        <>
          <AlternativeTitle figmaId="1364:11830" />
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
      {swapped && <RemovedItem figmaId="1364:11846" name={products[swapped.from].name} onUndo={undoSwap} />}
      <SectionTitle figmaId={id.section} title={excludedCount > 0 ? `담은 ${cartCount}개 중 ${deliverableCount}개 내일 아침 도착` : `내일 아침 도착 ${deliverableCount}개`} />
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
      {unavailable.map(({ product }) => (
        <SummaryCard key={`out-${product.id}`} figmaId="1364:11837" label="빠지는 상품" value={`${product.name} · 합계에서 뺐어요`} />
      ))}
      <PriceSummary figmaId={id.summary} subtotal={subtotal} shipping={delivery.shipping} />
      {sheet}
    </Screen>
  );
}
