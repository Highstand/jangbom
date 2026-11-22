import type { ReactNode } from "react";
import type { Product } from "@/data/types";
import { won } from "@/data/types";
import { ArrivalBadge } from "./ArrivalBadge";
import { Thumbnail } from "./Thumbnail";

type ProductCardProps = {
  product: Product;
  figmaId?: string;
  /** 용량 줄 (홈은 "1,000mL · 6번 샀어요") */
  details?: string;
  /** 오른쪽 행동 (담기 · 수량조절 · 품절 · 삭제 · 바꾸기) */
  action?: ReactNode;
  /** Type=Cart · State=Excluded · 장바구니에서 이번 주문에 안 들어가는 상품 (도착배지 State=Excluded) */
  excluded?: boolean;
};

/** 장봄/상품카드 (787:1524) · 오른쪽 행동만 바뀌고 이름·용량·가격·썸네일·도착 배지는 속성 */
export function ProductCard({ product, figmaId, details, action, excluded }: ProductCardProps) {
  return (
    <article data-component="product-card" data-figma={figmaId} className="flex w-full shrink-0 flex-col rounded-card bg-bg-card p-stack-md">
      <div className="flex w-full items-center gap-12">
        <Thumbnail src={product.image} alt={product.name} />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="whitespace-nowrap text-body-small-strong text-text-primary">{product.name}</p>
          <p className="whitespace-nowrap text-caption text-text-tertiary">{details ?? product.volume}</p>
          <div className="flex w-full flex-wrap content-center items-center gap-x-8 gap-y-4">
            <p className="whitespace-nowrap text-body-small-strong text-text-primary">{won(product.price)}</p>
            <ArrivalBadge state={excluded ? "excluded" : product.arrival} />
          </div>
        </div>
        {action}
      </div>
    </article>
  );
}
