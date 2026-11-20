import Image from "next/image";
import Link from "next/link";

type SearchInputProps = {
  placeholder: string;
  figmaId: string;
  /** 있으면 누를 때 그 화면으로 이동하는 진입 칸 */
  href?: string;
  focus?: boolean;
  /** 넘기면 입력값을 화면이 관리한다 (검색 결과) */
  value?: string;
  onChange?: (value: string) => void;
};

const box = "flex h-48 w-full shrink-0 items-center gap-8 rounded-control border bg-bg-card px-control-x py-control-y";
const icon = <Image src="/images/icons/search.svg" alt="" width={20} height={20} unoptimized className="size-20 shrink-0" />;

/** Input (키트 195:30 Default · 195:32 Focus) */
export function SearchInput({ placeholder, figmaId, href, focus, value, onChange }: SearchInputProps) {
  if (href) {
    return (
      <Link href={href} data-figma={figmaId} className={`${box} border-border-default`}>
        <span className="min-w-0 flex-1 text-body-small text-text-placeholder">{placeholder}</span>
        {icon}
      </Link>
    );
  }
  return (
    <label data-figma={figmaId} className={`${box} ${focus ? "border-border-focus" : "border-border-default"}`}>
      <input
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="min-w-0 flex-1 bg-transparent text-body-small text-text-primary outline-none placeholder:text-text-placeholder"
      />
      {icon}
    </label>
  );
}
