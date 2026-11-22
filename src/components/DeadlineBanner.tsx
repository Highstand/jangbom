import { Button } from "./Button";

type DeadlineBannerProps = {
  figmaId: string;
  deadline: string;
  arrival: string;
  remaining: string;
  /** ShowException · 예외 마감 줄 (17_improvements 문제 3) · 없으면 끔. v3: 장바구니에선 끄고 경고 박스만 말한다 */
  exception?: string;
  /** 배송지역행 Type=Inline · 없으면 끔. v3: 홈은 끄고 배너 아래 Type=Row로 따로 둔다 */
  region?: string;
  onChangeAddress?: () => void;
};

/** 장봄/마감도착배너 (493:1005) */
export function DeadlineBanner({ figmaId, deadline, arrival, remaining, exception, region, onChangeAddress }: DeadlineBannerProps) {
  return (
    <section
      data-component="deadline-banner"
      data-figma={figmaId}
      className="flex w-full shrink-0 flex-col gap-stack-sm rounded-card bg-bg-card p-16 inset-ring inset-ring-border-subtle"
    >
      <p className="text-h1 text-text-accent">{deadline}까지 주문하면</p>
      <p className="text-body-strong text-text-primary">
        {arrival} 도착 · {remaining} 남음
      </p>
      {exception && <p className="text-body-small text-text-warning">{exception}</p>}
      {region && (
        <div className="flex w-full items-center gap-inline-md">
          <p className="min-w-0 flex-1 text-body-small text-text-tertiary">{region} 기준</p>
          <Button variant="secondary" onClick={onChangeAddress}>
            주소 바꾸기
          </Button>
        </div>
      )}
    </section>
  );
}
