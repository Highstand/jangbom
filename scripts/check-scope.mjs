#!/usr/bin/env node
/**
 * G1 · 범위 검사 (CLAUDE.md 3장)
 *  1. src/에 fetch( 0개 · 결제 SDK import 0개, package.json에 결제 SDK 0개
 *  2. 빈·로딩·오류 상태와 예외 흐름 문구 0개 (10_screens.md 상태표 · 14_prototype.md 예외)
 *  3. git이 추적하는 .env* 파일 0개 (항상)
 *  4. @supabase/* 0개 (harness/state.json의 phase가 "screens"일 때만)
 *  5. 코드가 쓰는 이미지 경로는 모두 /images/로 시작하고 public/images/에 실제 파일이 있다
 *     (Figma 임시 URL · 외부 이미지 URL 0개)
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { finish } from "./lib/cdp.mjs";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const srcDir = join(root, "src");
const state = JSON.parse(readFileSync(join(root, "harness", "state.json"), "utf8"));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const PAYMENT_SDKS = ["@tosspayments", "@portone", "iamport", "@stripe", "stripe", "@paypal", "kakaopay", "naverpay", "braintree"];
const BANNED_TEXT = [
  // 10_screens.md 빈·로딩·오류 상태
  "주소를 넣으면 내일 아침 도착 여부를 알려 드려요",
  "도착 정보를 확인하지 못했어요",
  "찾는 상품이 없어요",
  "도착 확인 중",
  "아직 담은 게 없어요",
  "도착 확인 실패",
  "다시 시도",
  // 14_prototype.md 예외 1 (마감 지남) · E2-5 (결제 직전 품절)
  "방금 마감이 지났어요",
  "오늘 마감(",
  "아침 도착으로 바뀌었어요",
  "품절됐어요",
  "빼고 결제하기",
];

const CODE = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"]);
const walk = (dir) =>
  !existsSync(dir)
    ? []
    : readdirSync(dir).flatMap((n) => {
        const p = join(dir, n);
        return statSync(p).isDirectory() ? walk(p) : CODE.has(extname(n)) ? [p] : [];
      });

const failures = [];
const deps = { ...pkg.dependencies, ...pkg.devDependencies };

for (const name of Object.keys(deps)) {
  if (PAYMENT_SDKS.some((s) => name === s || name.startsWith(`${s}/`) || name.includes(s)))
    failures.push(`package.json  결제 SDK  ${name}`);
  if (state.phase === "screens" && name.startsWith("@supabase/"))
    failures.push(`package.json  Supabase는 화면 구현 단계에서 금지  ${name}`);
}

for (const file of walk(srcDir)) {
  const rel = relative(root, file);
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      const where = `${rel}:${i + 1}`;
      if (/\bfetch\s*\(/.test(line)) failures.push(`${where}  외부 호출  fetch(`);
      for (const s of PAYMENT_SDKS) if (new RegExp(`from\\s+["']${s}`).test(line)) failures.push(`${where}  결제 SDK import  ${s}`);
      if (state.phase === "screens" && /["']@supabase\//.test(line)) failures.push(`${where}  Supabase는 화면 구현 단계에서 금지`);
      for (const t of BANNED_TEXT) if (line.includes(t)) failures.push(`${where}  범위 밖 상태·예외 문구  "${t}"`);
      if (/figma\.com\/api\/mcp\/asset/.test(line)) failures.push(`${where}  Figma 임시 URL  (public/images/로 받아서 써야 함)`);
      for (const m of line.matchAll(/["'`](https?:\/\/[^"'`]+\.(?:png|jpe?g|webp|gif|svg|avif))["'`]/gi))
        failures.push(`${where}  외부 이미지 URL  ${m[1]}`);
      for (const m of line.matchAll(/["'`](\/[^"'`\s]+\.(?:png|jpe?g|webp|gif|svg|avif))["'`]/gi)) {
        const p = m[1];
        if (!p.startsWith("/images/")) failures.push(`${where}  이미지는 /images/ 아래만  ${p}`);
        else if (!existsSync(join(root, "public", p))) failures.push(`${where}  public${p} 파일 없음`);
      }
    });
}

let tracked = "";
try {
  tracked = execSync("git ls-files", { cwd: root, encoding: "utf8" });
} catch {}
for (const f of tracked.split("\n")) if (/(^|\/)\.env/.test(f)) failures.push(`git 추적 중  ${f}  (.env*는 커밋 금지)`);

finish(
  "check:scope",
  failures,
  `범위 밖 문구·외부 호출·결제 SDK·.env 커밋·잘못된 이미지 경로 0개${state.phase === "screens" ? " · Supabase 0개" : ""}`,
);
