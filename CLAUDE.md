@AGENTS.md

# 장봄 · 「도착 먼저」 화면 구현 하네스

담기 전에 내 주소로 내일 아침 도착이 되는지 알려 주는 장보기 앱 화면을
Next.js(App Router) + TypeScript 5 + Tailwind CSS v4로 만든다.
작업은 빌더가 하고, 통과 여부는 게이트 스크립트가 판정하고, 마지막에 사람이 한 번 승인한다.

## 1. 목적

### 화면 (7개 · 라우트 5개)
| 화면 | 라우트 | Figma 노드 |
|---|---|---|
| 1. 홈 | `/` | 774:1145 |
| 2. 주소 확인·변경 (바텀시트) | `/` 안 상태 (장바구니·결제에서도 연다) | 774:1225 |
| 3. 검색 결과 | `/search` | 774:1253 |
| 4. 장바구니 | `/cart` | 774:1337 |
| 4-1. 대체 상품으로 바꾼 뒤 | `/cart` 안 상태 | 782:1341 |
| 5. 결제 | `/checkout` | 774:1488 |
| 주문 완료 (최소) | `/complete` | 시안 없음. 기존 컴포넌트로 주문 번호 · 도착 시각 · 상품 요약만 |

### 끝났다는 기준
홈 → 검색 → 장바구니(4-1 포함) → 결제 → 주문 완료 클릭 테스트가 끝까지 통과하고,
Figma 6개 화면과 390 폭에서 비교했을 때 ±2px을 넘게 차이 나는 요소가 0개다.

### 어기면 안 되는 것 (08_solution-mvp.md 필수 기능)
1. 홈 콘텐츠의 첫 요소는 마감도착배너이고, "○○까지 주문하면"과 도착 문구가 들어 있다.
2. 모든 화면의 상품 카드마다 도착배지(내일 아침 확정/불가)가 정확히 1개 있다.

### 이번에 뺄 것
빈·로딩·오류 상태 / 예외 흐름(14_prototype.md 예외 1 전체, E2-5 결제 직전 품절) /
실제 결제·주소 검색·배송 API / Supabase·배포 (이 하네스가 끝난 뒤 따로)

### 자료 기준
- 우선순위: 10_screens.md > Figma 화면 링크 > 14_prototype.md > Make 링크 (reference/links.md)
- Figma 화면 링크: 컴포넌트·토큰·화면 구성·이미지의 근거
- Make 링크: 화면 이동 흐름만 참고하고, 코드·스타일은 따르지 않는다
- 링크를 못 읽으면 멈추고 사용자에게 알린다.

## 2. 파이프라인

| 단계 | 산출물 | 끝나면 돌릴 게이트 |
|---|---|---|
| ① 토큰 | `src/app/globals.css` `@theme` (tokens.json 1:1 + Figma 치수 블록) | G1 |
| ② 컴포넌트 | `src/components/` (Figma 화면에 쓰인 것만) · `public/images/` (Figma에서 내보낸 이미지) | G1 · G2(build·lint·tsc) |
| ③ 화면 조립 | 라우트 5개 · `src/data/mock.ts` · 이동 연결 | G1 · G2(+라우트 수) · G3 |
| ④ 검증 | `harness/reports/` 스크린샷 · 비교 이미지 · 결과 JSON | G1~G4 전체 → 사람 승인 |

- 지금 단계는 `harness/state.json`의 `stage`에 적는다. `npm run gate`는 이 단계에 맞는 게이트만 돌린다(`-- --all`이면 전부).
- 게이트를 모두 통과하기 전에는 다음 단계로 넘어가지 않는다. 통과하면 `stage`를 1 올린다.

## 3. 게이트 (`npm run gate`)

| 게이트 | 명령 | 통과 조건 |
|---|---|---|
| G1 토큰·범위 | `check:tokens` · `check:scope` | 토큰 밖 색(#hex·rgb·rgba) 0 · 대괄호 임의 값 0 · 코드의 토큰·허용 목록 밖 px 0 · globals.css의 px는 tokens.json 값 또는 figma-dimensions 블록 안 허용 목록 값만 · Tailwind 기본값 initial로 끔 / `fetch(`·결제 SDK 0 · 빈·오류·예외 문구 0 · git이 추적하는 `.env*` 0 · 이미지 경로는 `/images/`만, 파일 실재 · `@supabase/*` 0 (`phase`가 `screens`일 때만) |
| G2 라우트·빌드 | `build` · `lint` · `tsc` · `check:routes`(③부터) | 모두 통과 · `page.tsx`가 정확히 5개(위 라우트 표) |
| G3 ★ 필수 규칙 | `check:rules` | 실행 중인 앱에서 "어기면 안 되는 것" 1·2를 센다 · 상품 카드마다 `/images/` 이미지가 실제로 로드됨 |
| G4 Figma·흐름 | `check:figma` · `check:flow` | `data-figma` 요소가 `harness/figma/screens.json`과 x·y·너비·높이 ±2px 안(글자 노드는 너비 제외) · 클릭 테스트 끝까지 통과 |

- G3·G4는 `npm run gate`가 빌드한 앱을 포트 3100에서 직접 띄워 검사하고 끝나면 끈다.
- 결과는 `harness/reports/summary.json`, 비교 이미지는 `harness/reports/*-compare.png`(Figma | 앱 | 차이)에 쌓인다. 이 폴더는 커밋하지 않는다.

### 실패하면
- 토큰·색·임의 값 → ① · 컴포넌트 크기·배지 모양·빌드 → ② · 위치·흐름·필수 규칙·라우트·이미지·범위 → ③
- 같은 게이트가 3번 연속 실패하면(`harness/state.json`의 `failures`) 멈추고 사용자에게 보고한다.

### 사람 승인 (1곳)
④에서 G1~G4를 모두 통과하면 `harness/reports/*-compare.png`를 보여 주고,
사용자가 승인한 뒤에만 커밋·푸시한다.

## 4. 금지

- **토큰 밖 값:** tokens.json에 없는 색·간격·둥글기·글자 크기를 쓰지 않는다. 대괄호 임의 값(`p-[13px]`)과 Tailwind 기본 팔레트도 쓰지 않는다.
  - 예외는 `globals.css`의 `/* figma-dimensions:start */` ~ `/* figma-dimensions:end */` 블록에 있는 허용 목록 값뿐이다.
    - 줄 높이 16·20·21·24·26·32
    - 크기 56·48·52·64·18·5·14·28·390
  - 목록에 없는 값이 필요하면 멈추고 묻는다.
- **이미지:** 상품 사진·아이콘은 Figma 화면 링크에서 내보내 `public/images/`에 두고 `/images/...` 경로로만 쓴다. 이미지를 새로 만들거나 회색 박스·빈 칸으로 대신하지 않는다. Figma 임시 URL·외부 이미지 URL을 코드에 남기지 않는다.
- **범위 밖:** 시안 없는 화면·상태를 새로 디자인하지 않는다. 빈·로딩·오류 상태와 예외 흐름을 만들지 않는다. 컴포넌트는 이번 화면에 쓰이는 것만 만든다.
- **결제·API:** 결제는 목업이다. 외부 API를 부르거나 결제 SDK를 설치하지 않는다.
- **키:** API 키·토큰을 코드나 커밋에 넣지 않는다. 필요하면 `.env.local`에만 둔다.
- **읽기 전용:** `docs/`와 `reference/`는 고치지 않는다.
- **게이트:** `harness/figma/`와 `scripts/check-*.mjs` · `scripts/gate.mjs` · `scripts/lib/`는 사용자 승인 없이 고치지 않는다. 게이트를 통과시키려고 판정 기준을 바꾸지 않는다.
- **Supabase 단계로 넘어갈 때:** 사용자 요청이 있으면 `harness/state.json`의 `phase`를 `screens`에서 바꿔 `@supabase/*` 검사를 끈다. `.env*` 커밋 금지 검사는 계속 둔다.

## 5. 역할과 부르는 말

| 부르는 말 | 누가 | 하는 일 |
|---|---|---|
| "작업 시작" | `jangbom-builder` (.claude/agents/) | `harness/state.json`의 단계부터 이어서 만든다. 단계 끝마다 `npm run gate`를 돌리고, 통과하면 단계를 올린다. ③을 통과하면 `stage`를 4로 두고 "검수"를 부탁한다. |
| "검수" | `jangbom-reviewer` (.claude/agents/, 읽기 전용) | `npm run gate`를 돌리고, 게이트별 통과/실패 · 실패 위치 · 되돌아갈 단계를 보고한다. 소스 파일은 고치지 않는다. |

### 게이트가 찾는 표시 (빌더가 꼭 붙인다)
- `data-figma="<Figma 노드 id>"`: `harness/figma/screens.json`의 요소마다. 상태(4와 4-1 등)에 따라 노드 id가 다르면 상태에 맞는 id를 붙인다.
- `data-component="deadline-banner" | "product-card" | "arrival-badge"`: 필수 규칙 검사용

## 참고 문서
- docs/10_screens.md: 화면 목적 · 구성 요소 · 이동
- docs/11_design.md: 디자인 규칙(컴포넌트 쓰는 법, 금지 패턴)
- docs/14_prototype.md: 인터랙션 명세
- docs/13_design-system.md, docs/tokens.json: 토큰
- docs/17_improvements.md: Figma에 반영된 개선 3개
- docs/08_solution-mvp.md: 필수 기능 (어기면 안 되는 것의 근거)
- reference/flow.png, reference/links.md: 플로우 · Figma·Make 링크
- harness/figma/screens.json, harness/figma/*.png: Figma 기준 좌표와 화면 이미지 (게이트 기준)
