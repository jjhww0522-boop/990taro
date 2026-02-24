# AGENTS.md

## 프로젝트 헌법 v9

### 프로젝트 정체성
- 프로젝트명: 동양 오컬트 타로 챗
- 가격 정보(990원)는 앱명/로고에 포함하지 않는다.
- 비주얼 무드: 네온/사이버펑크 금지, 깊고 진중한 오컬트 분위기 유지

### 컬러 테마 (Tailwind 확장 토큰)
- `occult-bg-main`: `#121212`
- `occult-bg-card`: `#1C1C1E`
- `occult-accent`: `#8C1C1C`
- `occult-accent-hover`: `#A62B2B`
- `occult-accent-muted`: `#3A0F0F`
- `occult-accent-text`: `#D14F4F`
- `occult-text-main`: `#E0E0E0`
- `occult-text-muted`: `#828282`

### 카테고리 정책
- 고정 `pinned` 4대장 (하드코딩 포지션, 교체 금지)
- 항목: `연애`, `금전`, `직장학업`, `인간관계(연애 제외)`
- 동적 `dynamic` 2슬롯은 AI가 자율 생성/교체
- 동적 교체 기준: LRU (`lastUsedAt`이 가장 오래된 항목 교체)
- 카테고리별 3장/5장 스프레드 포지션은 서로 다르게 유지

### 무료 정책
- 무료 질문은 하루 첫 질문 1회 제공 (서버 `todayKst` 기준)
- 무료 응답 구성: 3장 스프레드 + 티저(함정) 1단어만 공개
- 무료 레이트리밋: IP당 5회/일, 초과 시 `429`
- `429` UX:
  - 최초 1회만 팝업 노출
  - 이후 입력창 `disabled`
  - `placeholder`/`tooltip`로 상태 안내

### 유료 정책 (MVP)
- 단일 가격: 990원 (번들 상품은 MVP 이후)
- 시간제 타이머 UI 금지
- 세션 토큰제: 질문 3회 + 자세히 1회
- 질문 카드 규칙:
  - `Q1~Q2`: 새로운 5장
  - `Q3`: 보조 1장
- 세션 TTL: 24h (`86400초`)
- 만료는 숨은 처리(만료 시간/카운트다운 등 표시 금지)

### 유료 보안 정책
- 결제 성공 시 HS256 JWT(`entitlement`) 발급
- `JWT_SECRET`은 256-bit 이상 강력 키 사용
- 유료 API는 `Authorization: Bearer <JWT>` 필수
- 서버에서 JWT 검증 필수
- 남은 횟수(`q`/`d`)는 Upstash Redis 세션 상태에서 서버가 차감
- 단, MVP는 관대한 단순 로직 허용

### 부트스트랩 정책
- 앱 마운트 시 `/api/bootstrap` 1회 호출
- 응답 필드: `todayKst`, `budgetExhausted`, `maintenanceMode`
- `/api/bootstrap`에 레이트리밋 잔여치 포함 금지 (불필요 Redis read 방지)

### 결제 이탈 방어
- 결제 진행 중 상태를 `PAYMENT_IN_PROGRESS`로 `localStorage` 백업
- 복귀 시 `/api/verify-payment`로 재검증
- PG 결제가 `PAID`이면 Redis 저장 실패 시에도 JWT는 반드시 발급

### UNLOCK UX 정책
- 해금 텍스트: Typewriter 효과 적용 (`40ms/자`, 최대 `80자`)
- Typewriter 종료 직후 `자세히(1회)` 버튼에 `occult-accent` 기반 Pulse 1~2회
- 애니메이션은 은은하게 유지
- `prefers-reduced-motion` 지원 필수

### 광고 정책
- 광고는 무료 사용자에게만 노출
- CLS 방지: 광고 placeholder 고정 높이 필수
- 키보드 활성 시 광고 숨김

### 구현 시 스킬 사용 규칙
1. `brainstorming`: 설계 문서 먼저 작성 (코딩 금지)
2. `frontend-design` + `ui-ux-pro-max`: UI/무드 설계 및 구현
3. `vercel-react-best-practices`: 성능/구조 품질 검증
4. `web-design-guidelines`: `file:line` 기준 UI/접근성 오딧
