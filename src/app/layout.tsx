import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { StoreProvider } from "@/data/store";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "600", "700"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "장봄 · 도착 먼저",
  description: "담기 전에 내일 아침 도착을 알려 주는 장보기",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="antialiased">
      <body className={`${notoSansKr.className} bg-bg-page text-text-primary`}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
