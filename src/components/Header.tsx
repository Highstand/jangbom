import Image from "next/image";
import Link from "next/link";

type HeaderProps = {
  title: string;
  figmaId?: string;
  backHref?: string;
  /** 없으면 오른쪽 장바구니 아이콘을 숨긴다 (자리는 유지) */
  cartCount?: number;
};

/** Header (키트 208:126) · left·right 슬롯 32는 비어 있어도 자리를 유지한다 */
export function Header({ title, figmaId, backHref, cartCount }: HeaderProps) {
  return (
    <header data-figma={figmaId} className="flex h-56 w-full shrink-0 items-center gap-8 bg-bg-card px-16">
      <div className="relative size-32 shrink-0">
        {backHref && (
          <Link href={backHref} aria-label="뒤로" className="absolute top-4 left-4 block size-24">
            <Image src="/images/icons/chevron-left.svg" alt="" width={24} height={24} unoptimized className="size-24" />
          </Link>
        )}
      </div>
      <h1 className="min-w-0 flex-1 text-center text-h3 text-text-primary">{title}</h1>
      <div className="relative size-32 shrink-0">
        {cartCount !== undefined && (
          <Link href="/cart" aria-label={`장바구니 ${cartCount}개`} className="absolute inset-0 block">
            <Image src="/images/icons/cart.svg" alt="" width={24} height={24} unoptimized className="absolute top-4 left-4 size-24" />
            <CountBadge count={cartCount} />
          </Link>
        )}
      </div>
    </header>
  );
}

/** CountBadge (키트 208:101) */
export function CountBadge({ count }: { count: number }) {
  return (
    <span className="absolute top-0 left-18 flex h-18 min-w-18 items-center justify-center rounded-pill bg-fill-primary px-5 text-caption text-text-on-primary">
      {count}
    </span>
  );
}
