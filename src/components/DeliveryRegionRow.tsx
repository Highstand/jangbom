import Image from "next/image";
import { useId } from "react";

type DeliveryRegionRowProps = {
  figmaId: string;
  /** Address · 예: "집 · 서울시 ○○구" */
  address: string;
  /** Label · 기본 "받는 곳" */
  label?: string;
  onChangeAddress: () => void;
};

/**
 * 장봄/배송지역행 Type=Row (v3 · 1380:1582) · 홈 마감도착배너 바로 아래, 줄 전체가 버튼인 카드 한 줄.
 * 버튼 안에 버튼을 둘 수 없어 오른쪽 "바꾸기"는 Button Small·Secondary 모양만 그린다.
 */
export function DeliveryRegionRow({ figmaId, address, label = "받는 곳", onChangeAddress }: DeliveryRegionRowProps) {
  const id = useId();
  return (
    <button
      type="button"
      data-figma={figmaId}
      aria-label="주소 바꾸기"
      aria-describedby={id}
      onClick={onChangeAddress}
      className="flex h-48 w-full shrink-0 items-center gap-inline-md rounded-card bg-bg-card px-16 text-left"
    >
      <span id={id} className="flex min-w-0 flex-1 items-center gap-inline-md">
        <span className="shrink-0 whitespace-nowrap text-body-small text-text-tertiary">{label}</span>
        <span className="min-w-0 flex-1 truncate text-body-small-strong text-text-primary">{address}</span>
      </span>
      <span className="inline-flex h-32 shrink-0 items-center justify-center gap-4 whitespace-nowrap rounded-button border border-border-default bg-bg-card px-12 text-body-small text-text-primary">
        바꾸기
      </span>
      <Image src="/images/icons/chevron-right-24.svg" alt="" width={24} height={24} unoptimized className="size-24 shrink-0" />
    </button>
  );
}
