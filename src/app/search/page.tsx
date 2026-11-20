"use client";

import { useState } from "react";
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

/** Figma 3. 검색 결과(검색어 "우유")에 있는 카드의 노드 id */
const cardIds: Record<string, string> = {
  "fresh-milk": "788:1462",
  "organic-milk": "788:1478",
  "low-fat-milk": "788:1491",
  "lactose-free-milk": "788:1503",
};

/**
 * 3. 검색 결과 (774:1253)
 * 입력할 때마다 상품 이름으로 거른다. 품절 상품이 결과에 있으면 대체 상품을 아래로 따로 보여 준다.
 * 결과가 없으면 목록만 비운다 (빈 상태 문구는 이번 범위 밖 · CLAUDE.md 1장).
 */
export default function SearchPage() {
  const { deliverableCount } = useStore();
  const [query, setQuery] = useState(search.query);

  const keyword = query.trim();
  const matches = Object.values(products).filter((p) => p.name.includes(keyword));
  const alt = products[search.alternativeId];
  const showAlt = matches.some((p) => p.soldOut) && matches.includes(alt);
  const list = showAlt ? matches.filter((p) => p.id !== alt.id) : matches;
  const arriving = matches.filter((p) => p.arrival === "confirmed" && !p.soldOut).length;

  return (
    <Screen
      header={<Header title="검색" figmaId="774:1254" backHref="/" cartCount={deliverableCount} />}
      bottom={
        <BottomContainer figmaId="774:1334">
          <Button href="/cart">장바구니 {deliverableCount}개 보기</Button>
        </BottomContainer>
      }
    >
      <SearchInput figmaId="774:1267" placeholder="어떤 품목을 찾으세요?" focus value={query} onChange={setQuery} />
      <p data-figma="774:1272" className="shrink-0 whitespace-nowrap text-body-small text-text-tertiary">
        {matches.length}개 중 {arriving}개 내일 아침 도착
      </p>
      {list.map((p) => (
        <ProductCard key={p.id} figmaId={cardIds[p.id]} product={p} action={<ProductAction product={p} />} />
      ))}
      {showAlt && (
        <>
          <AlternativeTitle figmaId="788:1717" />
          <ProductCard figmaId={cardIds[alt.id]} product={alt} action={<ProductAction product={alt} />} />
        </>
      )}
    </Screen>
  );
}
