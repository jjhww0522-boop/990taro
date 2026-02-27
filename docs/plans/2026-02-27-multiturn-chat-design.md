# 멀티턴 타로 상담 채팅 — 디자인 문서

## 개요
카드 3장 초기 해석 후, 실제 타로 가게처럼 AI가 질문을 이어가며 상담을 진행하는 구조.

## 플로우
1. `/result` Phase 1 (READING): 기존 캐러셀 + 총평 모달
2. 해석 로드 완료 → 4초 카운트다운 → 자동 Phase 2 전환 (또는 "지금 시작하기" 클릭)
3. Phase 2 (CHATTING): 카드 썸네일 스트립 상단 고정 + 채팅 UI

## 제한
- 무료: 하루 추가 답변 2회 (`consult:daily:{date}:{fingerprint}`)
- 유료(JWT): 세션당 5회 (`consult:session:{sid}`)
- 초기 해석 `/api/chat`는 기존 제한 유지

## 백엔드
신규 `POST /api/chat/consult`:
- Request: `{ cards, initialReading, history, message?, originalQuestion? }`
- Response: `{ message, remainingTurns }`
- `message` 없으면 AI가 오프너 생성 (초기 해석 요약 + 후속 질문)

## 프론트엔드 변경
- `result/page.tsx`에 `chatPhase: "reading" | "chatting"` 상태 추가
- 카운트다운 표시 (4초) + 스킵 버튼
- Phase 2 UI: 카드 썸네일 → 채팅 메시지 목록 → 입력창
