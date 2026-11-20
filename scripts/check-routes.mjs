#!/usr/bin/env node
/**
 * G2 · 라우트 수 (CLAUDE.md 3장)
 * src/app의 page.tsx가 정확히 5개이고, 경로가 / · /search · /cart · /checkout · /complete와 같다.
 */
import { readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { finish } from "./lib/cdp.mjs";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const appDir = join(root, "src", "app");
const EXPECTED = ["/", "/search", "/cart", "/checkout", "/complete"];

const pages = [];
(function walk(dir) {
  if (!existsSync(dir)) return;
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (/^page\.(tsx|ts|jsx|js)$/.test(n)) pages.push(p);
  }
})(appDir);

const routes = pages.map((p) => {
  const segs = relative(appDir, p).split(sep).slice(0, -1).filter((s) => !/^\(.*\)$/.test(s));
  return "/" + segs.join("/");
});

const failures = [];
if (routes.length !== EXPECTED.length) failures.push(`page 개수 ${routes.length}개 (기대 ${EXPECTED.length}개)`);
for (const r of EXPECTED) if (!routes.includes(r)) failures.push(`라우트 없음  ${r}`);
for (const r of routes) if (!EXPECTED.includes(r)) failures.push(`계획에 없는 라우트  ${r}`);

finish("check:routes", failures, `라우트 ${EXPECTED.length}개 일치 (${EXPECTED.join(" · ")})`);
