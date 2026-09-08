# 웹 타이포그래피 & 정밀 엔지니어링 폰트 디자인 가이드

웹사이트에서 영문 폰트를 정밀하게 다루기 위한 타이포그래피 원칙, 반응형 `clamp()` 설정법, 추천 폰트 목록 및 정교한 생산라인·엔지니어링 대시보드를 위한 실무 CSS 가이드입니다.

---

## 1. 영문 웹 타이포그래피 기본 조정 원칙

영문은 한글과 글자 구조(어센더·디센더, 글자 폭의 다양성 등)가 달라 자간, 줄간격, 대소문자 변환 속성을 세밀하게 다뤄야 정돈된 인상을 줍니다.

### ① 자간 (Letter Spacing)
- **대형 헤드라인 (Display / Headings):** 글자가 커질수록 자간이 시각적으로 벌어져 보이므로 살짝 음수 값(`-0.01em` ~ `-0.03em`)을 부여해 밀도 있고 단단하게 구성합니다.
- **대문자 레이블/버튼 (All Caps):** 전부 대문자로 구성된 텍스트는 시각적으로 답답해 보일 수 있으므로 양수 값(`+0.04em` ~ `+0.08em`)으로 자간을 넓혀 가독성을 확보합니다.
- **일반 본문 (Body text):** 폰트 자체의 메트릭스 커닝(`normal`)을 유지하는 것이 가장 자연스럽습니다.

### ② 정렬과 줄바꿈 (Alignment & Hyphenation)
- **좌측 정렬 기본:** 영문은 단어 길이가 불규칙하므로 양끝 정렬(`justify`) 시 발생하는 빈틈(River effect)을 피하기 위해 `text-align: left;`를 권장합니다.
- **외톨이 단어(Orphans) 방지:** 줄 끝에 단어 하나만 남는 현상을 방지하기 위해 `text-wrap: pretty` (본문) 또는 `text-wrap: balance` (제목)를 활용합니다.
- **자동 하이픈:** 폭이 좁은 카드나 컬럼에서는 `hyphens: auto;`로 긴 단어를 자연스럽게 분절합니다.

### ③ 행간 (Line Height)
- **본문:** 단위 없는 배수 `1.5` ~ `1.65`를 권장합니다.
- **대형 제목:** 큰 폰트 크기에서 행간이 너무 벌어지지 않도록 `1.1` ~ `1.25` 수준으로 좁혀줍니다.

### ④ 렌더링 최적화
```css
body {
  text-rendering: optimizeLegibility;
  font-feature-settings: "kern" 1, "liga" 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## 2. 반응형 유동형 타이포그래피: `clamp()` 설정법

미디어 쿼리 없이 화면 폭(375px ~ 1440px)에 맞춰 매끄럽게 비례 축소/확대되는 시스템입니다. 브라우저 줌 기능과의 호환성을 위해 상대 단위(`rem`)와 뷰포트 단위(`vw`)를 결합합니다.

```css
:root {
  /* 본문 (Mobile: 16px → Desktop: 18px) */
  --font-body: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);

  /* 소제목 H3 (Mobile: 20px → Desktop: 24px) */
  --font-h3: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);

  /* 중제목 H2 (Mobile: 26px → Desktop: 36px) */
  --font-h2: clamp(1.625rem, 1.35rem + 1.2vw, 2.25rem);

  /* 대형 타이틀 H1 (Mobile: 32px → Desktop: 56px) */
  --font-h1: clamp(2rem, 1.2rem + 3.5vw, 3.5rem);
}
```

---

## 3. 디자이너들이 선호하는 고완성도 영문 폰트 큐레이션

### ① 현대적인 산세리프 (Sans-serif)
- **Inter (Google Fonts / 무료):** 화면 UI 가독성을 극대화한 현대 인터페이스 표준 폰트.
- **Geist (Open Source / 무료):** Vercel에서 설계한 정밀하고 테크 감성이 돋보이는 서체.
- **Helvetica Neue / Neue Haas Grotesk (상용):** 스위스 모던 타이포그래피의 상징, 중립적이고 단단한 조형미.

### ② 독립 파운드리 고완성도 서체 (Independent Foundries)
- **ABC Diatype (Dinamo / 상용):** 칼같은 획 마감과 기계적 정밀함을 지닌 스위스 테크니컬 산세리프.
- **Söhne (Klim Type Foundry / 상용):** 아크치덴츠 그로테스크를 현대적으로 재해석하여 묵직한 신뢰감을 제공.
- **Neue Montreal (Pangram Pangram / 상용):** 몬트리올 디자인 유산 기반, 에디토리얼과 모던 브랜딩의 강자.
- **Graphik (Commercial Type / 상용):** 글로벌 테크 및 브랜딩 프로젝트의 대표 워크호스 폰트.

### ③ Fontshare 고품질 무료 서체
- **Switzer:** 헬베티카/유니버스 계열의 단단하고 중립적인 네오-그로테스크.
- **Satoshi:** 기하학적 곡선과 직선이 조화된 모던 지오메트릭 산세리프.
- **Cabinet Grotesk / Clash Display:** 강렬한 대형 디스플레이용 타이틀 서체.

---

## 4. 정밀 생산라인 & 엔지니어링 대시보드 타이포그래피 시스템

공정 모니터링, 계측기, 센서 데이터, 시리얼 넘버 표기에 최적화된 산업용 타이포그래피 세팅입니다.

### ① 추천 페어링 (Pairing)
- **상용 조합:** `ABC Diatype` (UI/헤드라인) + `ABC Diatype Mono` (계측치/로그)
- **무료 조합:** `Switzer` (UI/헤드라인) + `Geist Mono` 또는 `JetBrains Mono` (계측치/로그)

### ② 핵심 CSS 스타일 가이드

```css
:root {
  /* 폰트 스택 */
  --font-sans: "ABC Diatype", "Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "ABC Diatype Mono", "Geist Mono", "JetBrains Mono", monospace;

  /* 산업용 다크 테마 컬러 */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --status-active: #10b981;
  --status-warning: #f59e0b;
  --status-critical: #ef4444;

  /* 폰트 스케일 */
  --font-metric-lg: clamp(2rem, 1.5rem + 2vw, 3rem);
  --font-body: 0.875rem; /* 14px (대시보드 고밀도 유지) */
  --font-meta: 0.75rem; /* 12px */
}

body {
  font-family: var(--font-sans);
  font-size: var(--font-body);
  line-height: 1.5;
  color: var(--text-primary);
  background-color: #0b0f17;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

/* 1. 실시간 계측 지표 (고정폭 숫자 필수) */
.metric-container {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.metric-value {
  font-family: var(--font-mono);
  font-size: var(--font-metric-lg);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings: "tnum" on, "lnum" on;
}

.metric-unit {
  font-family: var(--font-sans);
  font-size: var(--font-meta);
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
}

/* 2. 설비 인덱스 및 상태 태그 */
.industrial-label {
  font-family: var(--font-sans);
  font-size: var(--font-meta);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}

.stage-badge {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  padding: 0.15rem 0.4rem;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}

/* 3. 정밀 스펙 테이블 */
.spec-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-body);
}

.spec-table th {
  font-family: var(--font-sans);
  font-size: var(--font-meta);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  text-align: left;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid #1e293b;
}

.spec-table td.cell-metric,
.spec-table td.cell-timestamp {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" on;
  text-align: right;
  padding: 0.5rem 0.75rem;
}
```