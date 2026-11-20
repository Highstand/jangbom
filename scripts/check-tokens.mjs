#!/usr/bin/env node
/**
 * G1 · 토큰 검사 (CLAUDE.md 3장)
 *  1. src/의 색(#hex · rgb() · rgba())은 tokens.json에 있는 값만
 *  2. 코드(.ts/.tsx/.js/.jsx)에 대괄호 임의 값 0개 (p-[13px], text-[#333], [word-break:...])
 *  3. 코드에 토큰·허용 목록 밖 px 값 0개 ("13px"), 인라인 크기 직접 쓰기 0개 (width: 13)
 *  4. globals.css의 px 값은 tokens.json 값이거나, figma-dimensions 블록 안의 허용 목록 값만
 *  5. globals.css가 있으면 Tailwind 기본 색·간격·둥글기·글자 크기를 initial로 끈다
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { finish } from "./lib/cdp.mjs";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const srcDir = join(root, "src");
const tokens = JSON.parse(readFileSync(join(root, "docs", "tokens.json"), "utf8"));

/** Figma 텍스트 스타일·컴포넌트 치수 허용 목록 (tokens.json 아님, 사용자 승인) */
export const FIGMA_ALLOWED_PX = [16, 20, 21, 24, 26, 32, 56, 48, 52, 64, 18, 5, 14, 28, 390];

const tokenColors = new Set();
const tokenPx = new Set();
(function collect(node) {
  if (!node || typeof node !== "object") return;
  if (typeof node.$value === "string") {
    if (node.$type === "color" && node.$value.startsWith("#")) tokenColors.add(normHex(node.$value));
    const px = node.$value.match(/^(\d+(?:\.\d+)?)px$/);
    if (px) tokenPx.add(Number(px[1]));
  }
  for (const v of Object.values(node)) collect(v);
})(tokens);

function normHex(hex) {
  let h = hex.slice(1).toLowerCase();
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
  return `#${h}`;
}

const CODE = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const walk = (dir) =>
  !existsSync(dir)
    ? []
    : readdirSync(dir).flatMap((n) => {
        const p = join(dir, n);
        if (statSync(p).isDirectory()) return walk(p);
        return CODE.has(extname(n)) || extname(n) === ".css" ? [p] : [];
      });

const failures = [];
const at = (file, i, col, what, value) => failures.push(`${relative(root, file)}:${i + 1}:${col + 1}  ${what}  ${value}`);

for (const file of walk(srcDir)) {
  const isCode = CODE.has(extname(file));
  const isCss = extname(file) === ".css";
  const lines = readFileSync(file, "utf8").split("\n");
  let inFigmaBlock = false;
  lines.forEach((line, i) => {
    if (line.includes("figma-dimensions:start")) inFigmaBlock = true;
    if (line.includes("figma-dimensions:end")) inFigmaBlock = false;

    for (const m of line.matchAll(/#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b/g)) {
      if (!tokenColors.has(normHex(m[0]))) at(file, i, m.index, "토큰 밖 색", m[0]);
    }
    for (const m of line.matchAll(/\b(?:rgba?|hsla?)\([^)]*\)/g)) at(file, i, m.index, "토큰 밖 색", m[0]);

    if (isCode) {
      for (const m of line.matchAll(/[\w!:/.-]+-\[[^\]\s]+\]/g)) at(file, i, m.index, "대괄호 임의 값", m[0]);
      for (const m of line.matchAll(/(?<![\w-])\[[a-z-]+:[^\]\s]+\]/g)) at(file, i, m.index, "대괄호 임의 값", m[0]);
      for (const m of line.matchAll(/\b(\d+(?:\.\d+)?)px\b/g)) {
        const n = Number(m[1]);
        // next/image의 sizes="64px"처럼 토큰·허용 목록 값은 통과
        if (!tokenPx.has(n) && !FIGMA_ALLOWED_PX.includes(n)) at(file, i, m.index, "코드에 px 직접 쓰기", m[0]);
      }
      for (const m of line.matchAll(/\b(?:width|height|margin\w*|padding\w*|gap|top|left|right|bottom|fontSize|lineHeight|borderRadius)\s*:\s*\d+/g))
        at(file, i, m.index, "인라인 크기 직접 쓰기", m[0]);
    }

    if (isCss) {
      for (const m of line.matchAll(/(\d+(?:\.\d+)?)px\b/g)) {
        const n = Number(m[1]);
        const ok = inFigmaBlock ? FIGMA_ALLOWED_PX.includes(n) || tokenPx.has(n) : tokenPx.has(n);
        if (!ok) at(file, i, m.index, inFigmaBlock ? "허용 목록 밖 Figma 치수" : "tokens.json 밖 px 값", m[0]);
      }
    }
  });
}

const globals = join(srcDir, "app", "globals.css");
if (existsSync(globals)) {
  const css = readFileSync(globals, "utf8");
  for (const reset of ["--color-*: initial", "--spacing-*: initial", "--radius-*: initial", "--text-*: initial"]) {
    if (!css.includes(reset)) failures.push(`src/app/globals.css  Tailwind 기본값을 끄지 않음  "${reset};" 없음`);
  }
}

finish("check:tokens", failures, "토큰 밖 색·임의 값·허용 목록 밖 치수 0개");
