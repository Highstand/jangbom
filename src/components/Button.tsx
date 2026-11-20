import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "text";

type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  chevron?: boolean;
  className?: string;
  "data-figma"?: string;
};

const base = "inline-flex shrink-0 items-center justify-center whitespace-nowrap";
const styles: Record<Variant, string> = {
  // Size=Large · Type=Primary (하단 CTA)
  primary: "h-52 w-full rounded-button bg-fill-primary px-control-x py-control-y text-body-strong text-text-on-primary active:bg-fill-primary-pressed",
  // Size=Small · Type=Secondary (폭이 내용으로 정해져 Figma처럼 테두리 두께가 폭에 들어가는 실제 border)
  secondary: "h-32 gap-4 rounded-button border border-border-default bg-bg-card px-12 text-body-small text-text-primary",
  // Size=Small · Type=Text
  text: "h-32 gap-4 rounded-8 text-body-small text-text-secondary",
};
// Size=Small · Type=Secondary · State=Disabled (17_improvements 3-1)
const disabledSecondary = "h-32 gap-4 rounded-button border border-border-subtle bg-fill-disabled px-12 text-body-small text-text-disabled";

/** Button (키트 195:29) */
export function Button({ children, variant = "primary", href, onClick, disabled, chevron, className = "", ...rest }: ButtonProps) {
  const cls = `${base} ${disabled && variant === "secondary" ? disabledSecondary : styles[variant]} ${className}`;
  const content = (
    <>
      {children}
      {chevron && <Image src="/images/icons/chevron-right.svg" alt="" width={16} height={16} unoptimized className="size-16" />}
    </>
  );
  if (href && !disabled) {
    return (
      <Link href={href} className={cls} data-figma={rest["data-figma"]}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls} data-figma={rest["data-figma"]}>
      {content}
    </button>
  );
}
