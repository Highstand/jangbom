import { Card } from "./Card";

/** 장봄/도착예정안내 (484:1199) */
export function ArrivalInfo({ figmaId, label, arrival }: { figmaId?: string; label: string; arrival: string }) {
  return (
    <Card figmaId={figmaId} outlined gap="8">
      <p className="w-full text-body-small text-text-tertiary">{label}</p>
      <p className="w-full text-body-strong text-text-primary">{arrival}</p>
    </Card>
  );
}
