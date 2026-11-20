import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { getCatalog } from "@/data/catalog";
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Supabase products · favorites (서버에서 캐시해 불러옴 · src/data/catalog.ts)
  const catalog = await getCatalog();
  return (
    <html lang="ko" className="antialiased">
      <body className={`${notoSansKr.className} bg-bg-page text-text-primary`}>
        <StoreProvider catalog={catalog}>{children}</StoreProvider>
      </body>
    </html>
  );
}
