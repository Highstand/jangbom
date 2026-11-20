#!/usr/bin/env node
/**
 * G4 · 클릭 테스트 (CLAUDE.md 1장 "끝났다는 기준")
 * 홈 → 주소 시트 → 검색 → 장바구니 → 4-1 바꾸기·되돌리기 → 결제 → 주문 완료를
 * 새로고침 없이 버튼만 눌러 끝까지 간다. 문구는 Figma 화면에 적힌 그대로 찾는다.
 */
import { openBrowser, finish } from "./lib/cdp.mjs";

const failures = [];
const page = await openBrowser();
const visibleText = () =>
  page.evaluate("[...document.querySelectorAll('main,[role=dialog]')].filter(e=>e.getClientRects().length).map(e=>e.innerText).join('\\n')");
const hasDialog = () => page.evaluate("[...document.querySelectorAll('[role=dialog]')].some(e=>e.getClientRects().length>0)");

async function step(label, fn) {
  try {
    const ok = await fn();
    if (ok === false) failures.push(label);
    else console.log(`  ✓ ${label}`);
    return ok !== false;
  } catch (e) {
    failures.push(`${label} (${e.message})`);
    return false;
  }
}

try {
  await page.goto("/");
  (await step("홈에서 '주소 바꾸기' → 주소 시트 열림", async () => (await page.click("주소 바꾸기")) && (await hasDialog()))) &&
    (await step("시트에서 '회사' 고르고 '이 주소로 저장' → 시트 닫힘", async () =>
      (await page.click("회사")) && (await page.click("이 주소로 저장")) && !(await hasDialog())));
  await step("홈 검색창 → /search", async () => (await page.click("어떤 품목을 찾으세요?")) && (await page.path()) === "/search");
  await step("검색 '뒤로' → /", async () => (await page.click("뒤로")) && (await page.path()) === "/");
  await step("'장바구니 N개 보기' → /cart", async () => (await page.click("보기", { endsWith: true })) && (await page.path()) === "/cart");
  await step("'이걸로 바꾸기' → '뺐어요 · 되돌리기' 상태(4-1)", async () =>
    (await page.click("이걸로 바꾸기")) && /뺐어요/.test(await visibleText()));
  await step("'되돌리기' → 빠지는 상품 안내가 돌아옴", async () =>
    (await page.click("되돌리기")) && /이번 주문에서 빠져요/.test(await visibleText()));
  await step("다시 '이걸로 바꾸기'", async () => page.click("이걸로 바꾸기"));
  await step("'○개 ○원 결제하기' → /checkout", async () => (await page.click("결제하기", { endsWith: true })) && (await page.path()) === "/checkout");
  await step("결제 '주소 바꾸기' → 시트 → 저장 후 /checkout에 머묾", async () =>
    (await page.click("주소 바꾸기")) && (await page.click("이 주소로 저장")) && (await page.path()) === "/checkout");
  await step("'○원 결제하기' → /complete", async () => (await page.click("결제하기", { endsWith: true })) && (await page.path()) === "/complete");
  await step("주문 완료에 주문 번호 · 도착 시각 · 주문 상품이 보임", async () => {
    const t = await visibleText();
    return /주문 번호/.test(t) && /도착/.test(t) && /주문 상품/.test(t);
  });
} catch (e) {
  failures.push(`실행 오류  ${e.message}  (앱이 ${process.env.BASE_URL ?? "http://localhost:3100"}에서 떠 있는지 확인)`);
} finally {
  await page.close();
}

finish("check:flow", failures, "홈 → 검색 → 장바구니(4-1) → 결제 → 주문 완료 끝까지 통과");
