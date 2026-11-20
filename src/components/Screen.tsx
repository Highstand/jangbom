import type { ReactNode } from "react";

/** 화면 틀 · Header / 콘텐츠(main) / BottomContainer */
export function Screen({ header, bottom, children }: { header: ReactNode; bottom?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-390 flex-col bg-bg-page">
      {header}
      <main className="flex w-full flex-1 flex-col gap-12 px-page-horizontal pt-16 pb-24">{children}</main>
      {bottom}
    </div>
  );
}
