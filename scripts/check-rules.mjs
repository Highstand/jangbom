#!/usr/bin/env node
/**
 * G3 · ★ 필수 규칙 (08_solution-mvp.md 필수 기능 · CLAUDE.md 1장 "어기면 안 되는 것")
 * 실행 중인 앱(BASE_URL, 기본 http://localhost:3100)에서 센다.
 *  1. 홈: 보이는 <main>의 첫 요소가 data-component="deadline-banner"이고 "까지 주문하면"과 "도착" 문구가 있다
 *  2. 홈·검색·장바구니·4-1: 보이는 data-component="product-card"마다
 *     data-component="arrival-badge"가 정확히 1개이고 글자가 "내일 아침 확정" 또는 "내일 아침 불가"다
 *  3. 같은 화면들: 상품 카드마다 /images/ 아래 이미지가 실제로 로드돼 있다 (회색 박스·빈 칸 금지)
 */
import { openBrowser, finish } from "./lib/cdp.mjs";

const SCENES = [
  { name: "홈", path: "/" },
  { name: "검색", path: "/search" },
  { name: "장바구니", path: "/cart" },
  { name: "4-1 바꾼 뒤", path: "/cart", actions: ["이걸로 바꾸기"] },
];

const failures = [];
const page = await openBrowser();
try {
  for (const s of SCENES) {
    await page.goto(s.path);
    for (const a of s.actions ?? []) if (!(await page.click(a))) failures.push(`${s.name}  "${a}" 버튼을 찾지 못함`);

    const r = await page.evaluate(`(async()=>{
      const vis=(el)=>el.getClientRects().length>0;
      const main=[...document.querySelectorAll('main')].find(vis);
      const first=main?.firstElementChild;
      const cards=[...document.querySelectorAll('[data-component="product-card"]')].filter(vis);
      await Promise.all(cards.flatMap(c=>[...c.querySelectorAll('img')]).map(i=>i.complete?null:new Promise(r=>{i.onload=i.onerror=r;})));
      return {
        hasMain: !!main,
        first: first ? { component: first.getAttribute('data-component'), text: first.innerText } : null,
        cards: cards.map((c,i)=>{
          const name=(c.innerText||'').split('\\n')[0];
          const badges=[...c.querySelectorAll('[data-component="arrival-badge"]')].filter(vis).map(b=>b.innerText.trim());
          const imgs=[...c.querySelectorAll('img')].filter(vis).map(img=>{
            let src=img.currentSrc||img.src; try{const u=new URL(src); src=u.searchParams.get('url')||u.pathname;}catch{}
            return { src: decodeURIComponent(src), loaded: img.complete && img.naturalWidth>0 };
          });
          return { name: name||('카드 '+(i+1)), badges, imgs };
        }),
      };
    })()`);

    if (!r.hasMain) {
      failures.push(`${s.name}  보이는 <main>이 없음`);
      continue;
    }
    if (s.path === "/" && !s.actions) {
      const f = r.first;
      if (!f || f.component !== "deadline-banner") failures.push(`홈  콘텐츠 첫 요소가 마감도착배너가 아님 (첫 요소: ${f?.component ?? "없음"})`);
      else if (!/까지 주문하면/.test(f.text) || !/도착/.test(f.text)) failures.push(`홈  마감도착배너에 "까지 주문하면" 또는 "도착" 문구 없음`);
    }
    if (r.cards.length === 0) failures.push(`${s.name}  상품 카드(data-component="product-card")가 없음`);
    for (const c of r.cards) {
      if (c.badges.length !== 1) failures.push(`${s.name} · ${c.name}  도착배지 ${c.badges.length}개 (정확히 1개여야 함)`);
      else if (!["내일 아침 확정", "내일 아침 불가"].includes(c.badges[0])) failures.push(`${s.name} · ${c.name}  도착배지 글자가 "${c.badges[0]}"`);
      const img = c.imgs.find((i) => i.src.startsWith("/images/"));
      if (!img) failures.push(`${s.name} · ${c.name}  /images/ 상품 이미지 없음 (${c.imgs.map((i) => i.src).join(", ") || "img 없음"})`);
      else if (!img.loaded) failures.push(`${s.name} · ${c.name}  이미지 로드 실패  ${img.src}`);
    }
  }
} catch (e) {
  failures.push(`실행 오류  ${e.message}  (앱이 ${process.env.BASE_URL ?? "http://localhost:3100"}에서 떠 있는지 확인)`);
} finally {
  await page.close();
}

finish("check:rules", failures, "홈 첫 요소 마감도착배너 · 상품 카드마다 도착배지 1개 · 상품 이미지 로드");
