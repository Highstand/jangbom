#!/usr/bin/env node
/**
 * 게이트 실행기 · npm run gate
 * harness/state.json의 stage에 맞는 게이트만 돌린다 (--all이면 전부, --stage N이면 그 단계).
 *   ① G1 토큰·범위
 *   ② G1 + G2(build · lint · tsc)
 *   ③ G1 + G2(+ 라우트 수) + G3 ★ 필수 규칙
 *   ④ G1~G4 전체 (Figma 비교 · 클릭 테스트)
 * G3·G4는 빌드한 앱을 포트 3100에서 직접 띄워 검사하고 끝나면 끈다.
 * 결과: harness/reports/summary.json, 연속 실패 횟수: harness/state.json의 failures
 */
import { spawn, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const statePath = join(root, "harness", "state.json");
const reportsDir = join(root, "harness", "reports");
mkdirSync(reportsDir, { recursive: true });
const state = JSON.parse(readFileSync(statePath, "utf8"));
const args = process.argv.slice(2);
const stage = args.includes("--all") ? 4 : args.includes("--stage") ? Number(args[args.indexOf("--stage") + 1]) : state.stage;
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

/** 게이트 → 실패하면 되돌아갈 단계 (CLAUDE.md 3장) */
const GATES = [
  { gate: "G1", name: "check:tokens", cmd: ["node", "scripts/check-tokens.mjs"], from: 1, back: 1 },
  { gate: "G1", name: "check:scope", cmd: ["node", "scripts/check-scope.mjs"], from: 1, back: 3 },
  { gate: "G2", name: "lint", cmd: ["npx", "eslint"], from: 2, back: 2 },
  { gate: "G2", name: "tsc", cmd: ["npx", "tsc", "--noEmit"], from: 2, back: 2, afterBuild: true },
  { gate: "G2", name: "build", cmd: ["npx", "next", "build"], from: 2, back: 2 },
  { gate: "G2", name: "check:routes", cmd: ["node", "scripts/check-routes.mjs"], from: 3, back: 3 },
  { gate: "G3", name: "check:rules", cmd: ["node", "scripts/check-rules.mjs"], from: 3, back: 3, server: true },
  { gate: "G4", name: "check:figma", cmd: ["node", "scripts/check-figma.mjs"], from: 4, back: 3, server: true },
  { gate: "G4", name: "check:flow", cmd: ["node", "scripts/check-flow.mjs"], from: 4, back: 3, server: true },
];
const order = ["check:tokens", "check:scope", "lint", "build", "tsc", "check:routes", "check:rules", "check:figma", "check:flow"];
const plan = order.map((n) => GATES.find((g) => g.name === n)).filter((g) => g.from <= stage);

function run(g) {
  const r = spawnSync(g.cmd[0], g.cmd.slice(1), { cwd: root, encoding: "utf8", env: { ...process.env, BASE_URL } });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
  return { ok: r.status === 0, out };
}

async function startServer() {
  const proc = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: root, stdio: "ignore", detached: true });
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE_URL)).ok) return proc;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  try {
    process.kill(-proc.pid);
  } catch {}
  throw new Error(`포트 ${PORT}에서 앱을 띄우지 못했어요 (이미 다른 프로그램이 쓰고 있는지 확인)`);
}

console.log(`게이트 실행 · 단계 ${stage} · ${plan.map((g) => g.name).join(" → ")}\n`);
const results = [];
let server = null;
let buildFailed = false;
try {
  for (const g of plan) {
    if (g.server && buildFailed) {
      results.push({ ...g, ok: false, out: "build가 실패해 실행하지 않음" });
      continue;
    }
    if (g.server && !server) server = await startServer();
    const r = run(g);
    if (g.name === "build" && !r.ok) buildFailed = true;
    results.push({ ...g, ...r });
    console.log(`${r.ok ? "✓" : "✗"} ${g.gate} ${g.name}`);
    if (!r.ok) console.log(r.out.split("\n").slice(-25).map((l) => `    ${l}`).join("\n"));
  }
} catch (e) {
  results.push({ gate: "G3", name: "server", back: 3, ok: false, out: e.message });
  console.log(`✗ 서버  ${e.message}`);
} finally {
  if (server) {
    try {
      process.kill(-server.pid);
    } catch {}
  }
}

// 게이트별 연속 실패 횟수
const byGate = {};
for (const r of results) byGate[r.gate] = (byGate[r.gate] ?? true) && r.ok;
state.failures = state.failures ?? {};
for (const [gate, ok] of Object.entries(byGate)) state.failures[gate] = ok ? 0 : (state.failures[gate] ?? 0) + 1;
writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n");

const failed = results.filter((r) => !r.ok);
const stop = Object.entries(state.failures).filter(([, n]) => n >= 3).map(([g]) => g);
const summary = {
  stage,
  passed: failed.length === 0,
  stop: stop.length ? `같은 게이트 3번 연속 실패: ${stop.join(", ")} · 멈추고 사용자 확인` : null,
  backTo: failed.length ? Math.min(...failed.map((r) => r.back)) : null,
  results: results.map(({ gate, name, ok, back, out }) => ({ gate, name, ok, back, out: ok ? undefined : out.split("\n").slice(-40).join("\n") })),
  failures: state.failures,
};
writeFileSync(join(reportsDir, "summary.json"), JSON.stringify(summary, null, 2));

console.log(
  failed.length === 0
    ? `\n✓ 단계 ${stage} 게이트 모두 통과${stage >= 4 ? " · harness/reports/*-compare.png를 사용자에게 보여 주고 승인받기" : ""}`
    : `\n✗ 실패 ${failed.length}개 · ${summary.backTo}단계로 돌아가기${summary.stop ? `\n■ ${summary.stop}` : ""}`,
);
process.exit(failed.length === 0 ? 0 : 1);
