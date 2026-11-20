"use client";

import { BottomContainer } from "@/components/BottomContainer";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { ProductAction } from "@/components/ProductAction";
import { ProductCard } from "@/components/ProductCard";
import { Screen } from "@/components/Screen";
import { SearchInput } from "@/components/SearchInput";
import { AlternativeTitle } from "@/components/SectionTitle";
import { products, search } from "@/data/mock";
import { useStore } from "@/data/store";

const cardIds: Record<string, string> = {
  "fresh-milk": "788:1462",
  "organic-milk": "788:1478",
  "low-fat-milk": "788:1491",
  "lactose-free-milk": "788:1503",
};

/** 3. 검색 결과 (774:1253) */
export default function SearchPage() {
  const { deliverableCount } = useStore();
  const alt = products[search.alternativeId];

  return (
    <Screen
      header={<Header title="검색" figmaId="774:1254" backHref="/" cartCount={deliverableCount} />}
      bottom={
        <BottomContainer figmaId="774:1334">
          <Button href="/cart">장바구니 {deliverableCount}개 보기</Button>
        </BottomContainer>
      }
    >
      <SearchInput figmaId="774:1267" placeholder={search.query} focus />
      <p data-figma="774:1272" className="shrink-0 whitespace-nowrap text-body-small text-text-tertiary">
        {search.summary}
      </p>
      {search.productIds.map((id) => (
        <ProductCard key={id} figmaId={cardIds[id]} product={products[id]} action={<ProductAction product={products[id]} />} />
      ))}
      <AlternativeTitle figmaId="788:1717" />
      <ProductCard figmaId={cardIds[alt.id]} product={alt} action={<ProductAction product={alt} />} />
    </Screen>
  );
}
