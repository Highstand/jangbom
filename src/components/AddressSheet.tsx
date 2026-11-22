"use client";

import Image from "next/image";
import { useState } from "react";
import type { Address } from "@/data/types";
import { BottomContainer } from "./BottomContainer";
import { Button } from "./Button";
import { Card } from "./Card";
import { Chip } from "./Chip";
import { ListRow } from "./ListRow";
import { SearchInput } from "./SearchInput";

type AddressSheetProps = {
  addresses: Address[];
  currentId: string;
  arrival: string;
  onSave: (id: string) => void;
  onClose: () => void;
};

/**
 * 2. 주소 확인·변경 바텀시트 (774:1225)
 * 열 때마다 새로 마운트해 지금 주소를 기준으로 고른다.
 */
export function AddressSheet({ addresses, currentId, arrival, onSave, onClose }: AddressSheetProps) {
  const [selectedId, setSelectedId] = useState(currentId);
  const selected = addresses.find((a) => a.id === selectedId) ?? addresses[0];

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-390 flex-col justify-end">
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-bg-inverse opacity-60" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-sheet-title"
        data-figma="1364:11801"
        className="relative flex w-full flex-col overflow-hidden rounded-t-card bg-bg-card"
      >
        <div className="flex w-full flex-col gap-12 px-page-horizontal pt-24 pb-12">
          {/* 제목 줄 · 키트 Header 오른쪽 슬롯(32)에 Icon/close (v3) · 바꾸지 않고 닫는다 */}
          <div data-figma="1380:2088" className="flex w-full items-center gap-8">
            <h2 id="address-sheet-title" className="min-w-0 flex-1 whitespace-nowrap text-h3 text-text-primary">
              도착 기준 주소
            </h2>
            <button type="button" aria-label="주소 시트 닫기" onClick={onClose} className="relative size-32 shrink-0">
              <Image src="/images/icons/close.svg" alt="" width={24} height={24} unoptimized className="absolute top-4 left-4 size-24" />
            </button>
          </div>
          <div data-figma="1364:11804" className="flex gap-8 self-start">
            {addresses.map((a) => (
              <Chip key={a.id} label={a.label} selected={a.id === selectedId} onClick={() => setSelectedId(a.id)} />
            ))}
          </div>
          <Card figmaId="1364:11807" outlined gap="8">
            <ListRow label={selected.label} value={selected.street} />
            <ListRow label="도착" value={`${arrival} 도착 가능`} />
          </Card>
          <SearchInput figmaId="1364:11810" placeholder="새 주소 검색" />
        </div>
        <BottomContainer figmaId="1364:11811" sticky={false}>
          <Button onClick={() => onSave(selected.id)}>이 주소로 저장</Button>
        </BottomContainer>
      </div>
    </div>
  );
}
