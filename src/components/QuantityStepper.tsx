import Image from "next/image";

type QuantityStepperProps = {
  name: string;
  quantity: number;
  onChange: (next: number) => void;
};

/** 장봄/수량조절 (484:1109) */
export function QuantityStepper({ name, quantity, onChange }: QuantityStepperProps) {
  return (
    <div className="flex shrink-0 items-center gap-inline-md rounded-control bg-bg-subtle p-4">
      <button type="button" aria-label={`${name} 하나 빼기`} disabled={quantity <= 1} onClick={() => onChange(quantity - 1)} className="size-24">
        <Image src="/images/icons/minus.svg" alt="" width={24} height={24} unoptimized className="size-24" />
      </button>
      <span className="text-body-small-strong text-text-primary">{quantity}</span>
      <button type="button" aria-label={`${name} 하나 더`} onClick={() => onChange(quantity + 1)} className="size-24">
        <Image src="/images/icons/plus.svg" alt="" width={24} height={24} unoptimized className="size-24" />
      </button>
    </div>
  );
}
