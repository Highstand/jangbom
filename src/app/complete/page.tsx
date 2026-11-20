"use client";

import { ArrivalInfo } from "@/components/ArrivalInfo";
import { BottomContainer } from "@/components/BottomContainer";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { ListRow } from "@/components/ListRow";
import { Screen } from "@/components/Screen";
import { SummaryCard } from "@/components/SummaryCard";
import { useStore } from "@/data/store";

/**
 * 주문 완료 (시안 없음) · CLAUDE.md 1장 예외대로
 * 기존 컴포넌트로 주문 번호 · 도착 시각 · 상품 요약 세 가지만 보여 준다.
 * 방금 Supabase orders에 저장한 주문을 보여 준다 (orders는 읽기를 막아 두어 되읽지 않음).
 */
export default function CompletePage() {
  const { placedOrder } = useStore();
  const [first, ...rest] = placedOrder?.items ?? [];
  const items = first ? (rest.length ? `${first.name} 외 ${rest.length}개` : first.name) : "";

  return (
    <Screen
      header={<Header title="주문 완료" />}
      bottom={
        <BottomContainer>
          <Button href="/">홈으로</Button>
        </BottomContainer>
      }
    >
      {/* 주문 없이 바로 들어온 경우(빈 상태)는 이번 범위가 아니라 비워 둔다 */}
      {placedOrder && (
        <>
          <Card outlined>
            <ListRow label="주문 번호" value={placedOrder.number} />
          </Card>
          <ArrivalInfo label="도착 시각" arrival={`${placedOrder.arrivalText}해요`} />
          <SummaryCard label="주문 상품" value={items} />
        </>
      )}
    </Screen>
  );
}
