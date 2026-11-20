"use client";

import { ArrivalInfo } from "@/components/ArrivalInfo";
import { BottomContainer } from "@/components/BottomContainer";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { ListRow } from "@/components/ListRow";
import { Screen } from "@/components/Screen";
import { SummaryCard } from "@/components/SummaryCard";
import { delivery, order } from "@/data/mock";
import { useStore } from "@/data/store";

/**
 * 주문 완료 (시안 없음) · CLAUDE.md 1장 예외대로
 * 기존 컴포넌트로 주문 번호 · 도착 시각 · 상품 요약 세 가지만 보여 준다.
 */
export default function CompletePage() {
  const { deliverable } = useStore();
  const [first, ...rest] = deliverable;
  const items = first ? (rest.length ? `${first.product.name} 외 ${rest.length}개` : first.product.name) : "";

  return (
    <Screen
      header={<Header title="주문 완료" />}
      bottom={
        <BottomContainer>
          <Button href="/">홈으로</Button>
        </BottomContainer>
      }
    >
      <Card outlined>
        <ListRow label="주문 번호" value={order.number} />
      </Card>
      <ArrivalInfo label="도착 시각" arrival={`${delivery.arrival}에 도착해요`} />
      <SummaryCard label="주문 상품" value={items} />
    </Screen>
  );
}
