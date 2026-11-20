/**
 * 게이트용 헤드리스 Chrome 도우미 (의존성 없이 Chrome DevTools Protocol 사용).
 * CHROME_PATH로 Chrome 경로를, BASE_URL로 앱 주소를 바꿀 수 있다.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100";

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function openBrowser() {
  const chromePath = CANDIDATES.find((p) => existsSync(p));
  if (!chromePath) throw new Error("Chrome을 찾지 못했어요. CHROME_PATH를 지정하세요.");
  const port = 9300 + Math.floor(Math.random() * 500);
  const profile = mkdtempSync(join(tmpdir(), "jangbom-gate-"));
  const proc = spawn(
    chromePath,
    ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "--no-first-run", "about:blank"],
    { stdio: "ignore" },
  );

  let wsUrl;
  for (let i = 0; i < 75 && !wsUrl; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      wsUrl = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
    } catch {}
    if (!wsUrl) await sleep(200);
  }
  if (!wsUrl) throw new Error("Chrome 디버깅 연결에 실패했어요.");

  const ws = new WebSocket(wsUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const i = ++id;
      pending.set(i, resolve);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  await send("Page.enable");
  await send("Runtime.enable");

  const page = {
    send,
    async evaluate(expression) {
      const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? "evaluate 실패");
      return r.result?.result?.value;
    },
    async viewport(width, height) {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    },
    /** 새로 불러온다 (상태 초기화) */
    async goto(path, height = 844) {
      await page.viewport(390, height);
      await send("Page.navigate", { url: path.startsWith("http") || path.startsWith("file:") ? path : BASE_URL + path });
      await sleep(1200);
      await page.evaluate("document.fonts ? document.fonts.ready.then(()=>true) : true");
    },
    /** 보이는 버튼 중 글자(또는 aria-label)가 맞는 것을 누른다. endsWith: true면 끝 글자로 찾는다 */
    async click(text, { endsWith = false } = {}) {
      const r = await page.evaluate(`(async()=>{
        const t=${JSON.stringify(text)}, ends=${endsWith};
        const b=[...document.querySelectorAll('button,a,[role=button],input')].filter(e=>e.getClientRects().length&&!e.disabled)
          .find(e=>{const s=(e.innerText||'').trim()||e.getAttribute('placeholder')||'';return ends? s.endsWith(t) : (s===t||e.getAttribute('aria-label')===t);});
        if(!b) return false; b.click(); await new Promise(r=>setTimeout(r,800)); return true;})()`);
      return r;
    },
    async path() {
      return page.evaluate("location.pathname");
    },
    async fullHeight() {
      return page.evaluate("document.documentElement.scrollHeight");
    },
    async screenshot() {
      const r = await send("Page.captureScreenshot", { format: "png" });
      return Buffer.from(r.result.data, "base64");
    },
    async close() {
      try {
        ws.close();
      } catch {}
      proc.kill();
      await sleep(300);
      rmSync(profile, { recursive: true, force: true });
    },
  };
  return page;
}

/** 결과를 출력하고 종료 코드를 정한다 */
export function finish(name, failures, okMessage) {
  if (failures.length === 0) {
    console.log(`✓ ${name} · ${okMessage}`);
    process.exit(0);
  }
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log(`\n✗ ${name} · 실패 ${failures.length}개`);
  process.exit(1);
}
