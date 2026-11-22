# 13. 장봄 디자인 시스템 · 토큰과 연결 점검

> **요약:** 장봄 베리어블 87개를 원시·의미 2단 구조로 `tokens.json`에 정리했고, `장봄/*` 컴포넌트 13개의 색·간격·둥글기를 점검해 직접 들어간 값 32개 레이어를 모두 토큰으로 연결했다(남은 것 0, 키트 원본에서 고칠 것 없음).

## 배경

- **Figma:** `🗂️ 실습` 페이지 › `Components` 섹션(195:20)
- **대상 컬렉션:** `장봄/primitive` · `장봄/semantic` · `장봄/spacing` · `장봄/radius` · `장봄/typography` (`CJ 교안` 컬렉션 16개는 제외)
- **관련 파일:** `tokens.json`(토큰), `12_components.md`(컴포넌트), `design.md`
- **표기:** 근거가 없는 판단은 ⚠️ **가정**으로 표시하고 6장에 모았다.

## 1. 토큰 구조

원시 토큰은 값을 그대로 갖고, 의미 토큰은 원시 토큰을 참조한다. 화면과 컴포넌트에는 의미 토큰을 먼저 쓰고, 맞는 의미 토큰이 없을 때만 원시 토큰을 쓴다.

| 묶음 | Figma 컬렉션 | 원시 | 의미 | 합계 |
|---|---|---|---|---|
| 색 `color` | 장봄/primitive · 장봄/semantic | 20 | 34 | 54 |
| 간격 `spacing` | 장봄/spacing | 9 | 8 | 17 |
| 둥글기 `radius` | 장봄/radius | 4 | 5 | 9 |
| 글자 `typography` | 장봄/typography | 7 | 0 | 7 |
| **합계** | | **40** | **47** | **87** |

### 1-1. 색 원시 토큰

| 계열 | 단계 → 값 |
|---|---|
| gray | 0 `#ffffff` · 100 `#f7f7f7` · 200 `#f0f1f4` · 300 `#dadde0` · 400 `#99a1a8` · 500 `#757d86` · 600 `#50585f` · 800 `#21242a` · 900 `#131518` |
| green | 50 `#eef7f1` · 100 `#d9efe1` · 300 `#bcd638` · 600 `#2a8550` · 700 `#23774a` |
| orange | 50 `#fff5eb` · 700 `#b45309` |
| red | 50 `#fff0f3` · 500 `#e30036` |
| yellow | 50 `#fffbe0` · 300 `#ffef79` |

### 1-2. 색 의미 토큰

| 그룹 | 토큰 → 원시 | Figma 적용 범위 |
|---|---|---|
| text | primary → gray/900 · secondary → gray/600 · tertiary → gray/500 · placeholder → gray/400 · on-primary → gray/0 · accent → green/600 · warning → orange/700 · error → red/500 · disabled → gray/500 | 글자 채움 |
| bg | card → gray/0 · page → gray/100 · subtle → gray/200 · accent → yellow/300 · accent-subtle → yellow/50 · warning-subtle → orange/50 · error-subtle → red/50 · inverse → gray/800 · highlight → green/50 | 프레임·도형 채움 |
| fill | primary → green/600 · primary-pressed → green/700 · secondary → gray/900 · tertiary → gray/200 · disabled → gray/300 | 프레임·도형 채움 |
| border | default → gray/300 · subtle → gray/200 · strong → gray/900 · focus → green/600 · error → red/500 · divider → gray/200 | 선 (divider는 채움도 가능) |
| icon | default → gray/600 · strong → gray/900 · accent → green/600 · disabled → gray/300 · subtle → gray/400 | 도형 채움·선 |

### 1-3. 간격 · 둥글기 · 글자

| 묶음 | 원시 | 의미 → 원시 |
|---|---|---|
| spacing | 0 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 | page-horizontal → 16 · stack-sm → 8 · stack-md → 16 · stack-lg → 24 · inline-sm → 4 · inline-md → 8 · control-x → 16 · control-y → 12 |
| radius | 4 · 8 · 12 · full(999) | button → 8 · control → 8 · card → 12 · pill → full · media → 4 |
| typography | font-family/base `Noto Sans KR` · font-size 12 · 14 · 16 · 18 · 20 · 24 | 없음 |

### 1-4. tokens.json 형식

| 항목 | 규칙 |
|---|---|
| 형식 | W3C 디자인 토큰(DTCG): 토큰마다 `$type`, `$value` |
| 경로 | `묶음.primitive.이름` / `묶음.semantic.그룹.이름` (예: `color.semantic.text.primary`) |
| 참조 | `{color.primitive.gray.900}` 형태. 47개 참조가 모두 실제 원시 토큰으로 이어지는지 확인함 |
| 단위 | 간격·둥글기·글자 크기에 `px`를 붙임 |
| 코드 변환 | CSS 변수 등으로 쓰려면 Style Dictionary 같은 변환 도구를 거친다 |

## 2. 누락 검사

| 항목 | 내용 |
|---|---|
| 대상 컴포넌트 | `장봄/*` 13개 (v3 추가 Variant는 3-1장): 수량조절 · 상태배지 · 배송지역행 · 마감도착배너 · 배송주소 · 도착예정안내 · 금액요약 · 상품항목 · 도착배지 · 상품카드 · 섹션제목 · 대체상품제목 · 요약카드 |
| 대상 속성 | 색(채움·선), 간격(항목 간격·안쪽 여백·줄바꿈 줄 간격), 둥글기(네 모서리) |
| 기준 | 베리어블이 연결되지 않고 값이 직접 들어간 곳. 0도 포함 (기존 키트가 0을 `spacing/0`으로 연결해 둔 규칙을 따름) |
| 결과 | 기존 8개는 모두 연결돼 있었음. 직접 들어간 값은 `12_components.md`에서 새로 만든 5개에서만 나옴 |
| 검사에서 뺀 것 | Variant를 묶는 보라 점선 틀(화면에 안 나옴), '양 끝 정렬' 프레임의 항목 간격(값이 쓰이지 않음), `장봄/*` 컴포넌트를 품은 인스턴스(원본 컴포넌트에서 검사) |

## 3. 연결 결과

| 컴포넌트 | 레이어 | 속성 | 값 | 연결한 토큰 |
|---|---|---|---|---|
| `장봄/도착배지` (3개) | 루트 | 안쪽 위·아래 | 4 | `spacing/inline-sm` |
| | 루트 | 안쪽 좌·우 | 8 | `spacing/inline-md` |
| | 루트 | 항목 간격 | 0 | `spacing/0` |
| | 루트 | 둥글기 | 999 | `radius/pill` |
| `장봄/상품카드` (7개) | 루트 | 안쪽 4방향 | 16 | `spacing/stack-md` |
| | 루트 | 항목 간격 | 12 | `spacing/12` |
| | 루트 | 둥글기 | 12 | `radius/card` |
| `장봄/상품카드` (Removed 제외 6개) | 행 | 항목 간격 | 12 | `spacing/12` |
| | 행 · 정보 · 가격·도착 | 안쪽 4방향 | 0 | `spacing/0` |
| | 정보 | 항목 간격 (세로) | 4 | `spacing/4` |
| | 가격·도착 | 항목 간격 (가로) | 8 | `spacing/inline-md` |
| | 가격·도착 | 줄바꿈 줄 간격 | 4 | `spacing/4` |
| | 행 · 정보 · 가격·도착 | 채움 | `#FFFFFF` | 채움 제거 (원래 투명 프레임) |
| `장봄/상품카드` (InCart) | 수량·삭제 | 항목 간격 (세로) | 4 | `spacing/4` |
| | 수량·삭제 | 안쪽 4방향 | 0 | `spacing/0` |
| `장봄/섹션제목` | 루트 | 안쪽 4방향 | 0 | `spacing/0` |
| `장봄/대체상품제목` | 루트 | 항목 간격 · 안쪽 4방향 | 0 | `spacing/0` |
| `장봄/요약카드` | 루트 | 안쪽 4방향 | 16 | `spacing/stack-md` |
| | 루트 | 항목 간격 | 0 | `spacing/0` |
| | 루트 | 둥글기 | 12 | `radius/card` |

| 확인 항목 | 결과 |
|---|---|
| 연결한 레이어 | 32개 |
| 다시 검사한 뒤 남은 직접 값 | 0곳 |
| 새로 만든 베리어블 | 없음 |
| 키트에 맞는 토큰이 없던 값 | 없음 |
| 화면 크기 | 그대로 (홈·검색·결제 390×844, 장바구니 390×1328, 바꾼 뒤 390×1093) |

## 3-1. v3에서 추가한 Variant · 속성

`docs/v3-spec.md` 4장 · Figma v3(1364:11787) 기준. 새 토큰은 없고 아래 값은 모두 기존 토큰에 연결한다.

| 컴포넌트 | 추가 | 이름 · 속성 | 값 · 연결 토큰 | 쓰는 곳 · 코드 |
|---|---|---|---|---|
| `장봄/도착배지` | Variant | `State=Excluded` (속성 없음, 문구 고정 "이번 주문에서 빠짐") | 채움 `bg/warning-subtle` · 글자 `text/warning` · `caption/caption` · 안쪽 위·아래 `spacing/inline-sm`, 좌·우 `spacing/inline-md` · `radius/pill` (State=Unavailable과 같은 틀) | 장바구니의 불가 상품 카드 · `ArrivalBadge state="excluded"` |
| `장봄/상품카드` | 속성 값 | Type=Cart · State=Excluded + Details "○mL · 결제에 안 들어가요" | 기존 Variant. 안의 도착배지만 State=Excluded, 오른쪽은 Button Small·Text "삭제" | 장바구니 · `ProductCard excluded` |
| `장봄/배송지역행` | Variant | `Type=Row` (기존 = `Type=Inline`) · 속성 `Address`(텍스트), `Label`(텍스트, 기본 "받는 곳") | 358×48 · 채움 `bg/card` · `radius/card` · 좌우 `spacing/16` · 항목 간격 `spacing/inline-md` · Label `body/small`·`text/tertiary` · Address `body/small-strong`·`text/primary` · 오른쪽 Button Small·Secondary "바꾸기" + Icon/chevron-right 24 · 줄 전체가 버튼 | 홈 마감도착배너 바로 아래 · `DeliveryRegionRow` |
| `장봄/요약카드` | 속성 | `ShowExcluded` (불리언, 기본 꺼짐) · 켜면 ListRow "빠진 상품" 추가 | 줄 사이 `spacing/stack-sm` | 결제 (장바구니에 불가 상품이 남아 있을 때만) · `SummaryCard excluded` |

| 기존 속성만 바꿔 쓰는 곳 (v3) | 값 |
|---|---|
| `장봄/마감도착배너` `ShowException` | 홈 켬 · 장바구니 끔 (장바구니는 경고 박스만 말한다) |
| `장봄/마감도착배너` 주소 줄(배송지역행 Type=Inline) | 홈 끔 (Type=Row로 배너 아래) · 장바구니 켬 |
| 주소 시트 제목 줄 | 키트 Header 오른쪽 슬롯(32)에 Icon/close · 변경 없이 닫힘 |

## 4. 토큰을 고른 기준

| 경우 | 고른 토큰 | 이유 |
|---|---|---|
| 카드 안쪽 16 | `spacing/stack-md` | 의미 토큰 중 카드 안쪽 여백에 해당 |
| 가로 간격 4·8 | `spacing/inline-sm` · `inline-md` | 인라인(가로) 의미 토큰 |
| 세로 간격 4 | `spacing/4` (원시) | 의미 토큰 `inline-sm`은 가로용이고 세로 4 의미 토큰은 없음 |
| 간격 12 | `spacing/12` (원시) | 12의 의미 토큰 `control-y`는 버튼·입력 안쪽용이라 뜻이 다름. 키트 Card도 `spacing/12` 사용 |
| 0 | `spacing/0` (원시) | 0의 의미 토큰 없음. 기존 장봄 컴포넌트와 같은 규칙 |
| 둥글기 12 · 999 | `radius/card` · `radius/pill` | 의미 토큰 |

## 5. 키트 원본에서 고칠 것

| 키트 부품 | 레이어 | 속성 | 지금 값 | 비고 |
|---|---|---|---|---|
| 없음 | — | — | — | 장봄 컴포넌트가 품은 Card · Button · ListRow · Thumbnail 인스턴스 안에서는 직접 들어간 색·간격·둥글기가 나오지 않았다 |

## 6. 아직 가정인 것

- ⚠️ **가정** 세로 간격 4와 간격 12는 맞는 의미 토큰이 없다고 보고 원시 토큰으로 연결했다. 자주 쓰이면 `stack-xs`(4) 같은 의미 토큰을 키트에 두는 것을 검토한다.
- ⚠️ **가정** 상품 카드 안 '행·정보·가격·도착'의 흰 채움은 컴포넌트를 만들 때 따라 들어간 기본값으로 보고 지웠다. 원래 화면 레이어가 투명이었던 것이 근거다.
- ⚠️ **가정** 0도 직접 들어간 값으로 보고 `spacing/0`에 연결했다. 기존 키트 규칙을 따른 것이고 `design.md`에 적힌 규칙은 아니다.
- ⚠️ **가정** tokens.json의 단위 `px`는 Figma 값(단위 없음)에 붙인 것이다. `radius.primitive.full`은 Figma 값 그대로 `999px`다.
- ⚠️ **가정** 글자 묶음은 Figma 베리어블에 글꼴·크기만 있어 의미 토큰이 없다. 줄 높이·굵기를 담은 텍스트 스타일 8개(`장봄/heading/h1` 등)는 베리어블이 아니어서 tokens.json에 넣지 않았다.
