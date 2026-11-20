#!/usr/bin/env node
/**
 * G4 · Figma 비교 (CLAUDE.md 3장)
 * harness/figma/screens.json의 화면마다 390 폭으로 앱을 열고,
 * data-figma="<노드 id>" 요소의 상자(x·y·너비·높이)가 Figma 좌표와 ±2px 안인지 센다.
 * 글자 노드(text: true)는 폰트 파일 차이로 너비가 달라질 수 있어 x·y·높이만 본다.
 * 산출물: harness/reports/<화면>.png · <화면>-compare.png (Figma | 앱 | 차이) · figma.json
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { openBrowser, finish } from "./lib/cdp.mjs";

const TOLERANCE = 2;
const root = join(fileURLToPath(import.meta.url), "..", "..");
const figmaDir = join(root, "harness", "figma");
const outDir = join(root, "harness", "reports");
mkdirSync(outDir, { recursive: true });
const { screens } = JSON.parse(readFileSync(join(figmaDir, "screens.json"), "utf8"));

const failures = [];
const report = {};
const page = await openBrowser();
try {
  for (const s of screens) {
    await page.goto(s.route, 844);
    for (const a of s.actions ?? []) if (!(await page.click(a))) failures.push(`${s.name}  "${a}" 버튼을 찾지 못함`);
    let height = s.height;
    if (s.height > 844) {
      await page.viewport(390, s.height);
      await new Promise((r) => setTimeout(r, 400));
      const actual = await page.fullHeight();
      if (Math.abs(actual - s.height) > TOLERANCE) failures.push(`${s.name}  화면 높이 ${actual} (Figma ${s.height})`);
      height = s.height;
    }

    const boxes = await page.evaluate(`(()=>{
      const out={};
      for (const el of document.querySelectorAll('[data-figma]')) {
        if (!el.getClientRects().length) continue;
        const r=el.getBoundingClientRect();
        out[el.getAttribute('data-figma')]={x:Math.round(r.left),y:Math.round(r.top+scrollY),w:Math.round(r.width),h:Math.round(r.height)};
      }
      return out;})()`);

    const rows = [];
    for (const el of s.elements) {
      const got = boxes[el.id];
      if (!got) {
        failures.push(`${s.name} · ${el.name} (${el.id})  data-figma 요소 없음`);
        rows.push({ ...el, missing: true });
        continue;
      }
      const keys = el.text ? ["x", "y", "h"] : ["x", "y", "w", "h"];
      const off = keys.filter((k) => Math.abs(got[k] - el[k]) > TOLERANCE);
      if (off.length)
        failures.push(`${s.name} · ${el.name} (${el.id})  ${off.map((k) => `${k} ${got[k]}≠${el[k]}`).join(", ")}`);
      rows.push({ ...el, got, off });
    }
    report[s.name] = rows;

    const shot = await page.screenshot();
    writeFileSync(join(outDir, `${s.file}.png`), shot);

    // 비교 이미지: Figma | 앱 | 차이(빨강)
    const figmaPng = join(figmaDir, `${s.file}.png`);
    if (existsSync(figmaPng)) {
      const html = `<!doctype html><body style="margin:0;background:#888;font:12px sans-serif;color:#fff">
<div style="display:flex;gap:12px;padding:8px"><div><div>Figma</div><img id=a src="data:image/png;base64,${readFileSync(figmaPng).toString("base64")}"></div>
<div><div>App</div><img id=b src="data:image/png;base64,${shot.toString("base64")}"></div><div><div>Diff</div><canvas id=c></canvas></div></div>
<script>window.done=new Promise(res=>{const a=document.getElementById('a'),b=document.getElementById('b');let n=0;const go=()=>{if(++n<2)return;
const w=390,h=Math.max(a.naturalHeight,b.naturalHeight),c=document.getElementById('c');c.width=w;c.height=h;const x=c.getContext('2d');
const A=new OffscreenCanvas(w,h).getContext('2d');A.drawImage(a,0,0);const B=new OffscreenCanvas(w,h).getContext('2d');B.drawImage(b,0,0);
const da=A.getImageData(0,0,w,h).data,db=B.getImageData(0,0,w,h).data;x.drawImage(b,0,0);x.fillStyle='rgba(255,255,255,.75)';x.fillRect(0,0,w,h);
const o=x.getImageData(0,0,w,h);for(let i=0;i<da.length;i+=4){if(Math.abs(da[i]-db[i])+Math.abs(da[i+1]-db[i+1])+Math.abs(da[i+2]-db[i+2])>90){o.data[i]=230;o.data[i+1]=0;o.data[i+2]=0;o.data[i+3]=255;}}
x.putImageData(o,0,0);res(true);};a.onload=go;b.onload=go;});</script></body>`;
      const file = join(outDir, `${s.file}-compare.html`);
      writeFileSync(file, html);
      await page.send("Emulation.setDeviceMetricsOverride", { width: 1220, height: height + 40, deviceScaleFactor: 1, mobile: false });
      await page.send("Page.navigate", { url: "file://" + file });
      await new Promise((r) => setTimeout(r, 600));
      await page.evaluate("window.done");
      writeFileSync(join(outDir, `${s.file}-compare.png`), await page.screenshot());
    }
  }
} catch (e) {
  failures.push(`실행 오류  ${e.message}  (앱이 ${process.env.BASE_URL ?? "http://localhost:3100"}에서 떠 있는지 확인)`);
} finally {
  await page.close();
}

writeFileSync(join(outDir, "figma.json"), JSON.stringify({ tolerance: TOLERANCE, report }, null, 1));
finish("check:figma", failures, `Figma 6개 화면 요소 모두 ±${TOLERANCE}px 안 · 비교 이미지 harness/reports/`);
