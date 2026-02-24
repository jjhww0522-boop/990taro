const BLOCKED_TERMS = [
  "사망확정",
  "질병확진",
  "범죄단정",
  "임신확정",
  "불임확정",
  "수익보장",
  "파산확정",
  "저주",
  "재앙",
  "반드시",
  "100%",
];

const FALLBACK_RISK_WORD = "갈림길";
const FALLBACK_LOCKED = "흐름을 천천히 읽어야 정확한 결이 보입니다";

function hasBlockedTerm(input: string) {
  return BLOCKED_TERMS.some((term) => input.includes(term));
}

function sanitizeText(input: string, maxLength: number) {
  const sliced = input.slice(0, maxLength);
  if (!hasBlockedTerm(sliced)) return sliced;
  return "흐름이 조심스럽게 흔들려, 단정 대신 균형을 권합니다.";
}

function isValidRiskWord(word: string) {
  return /^[가-힣]{2,8}$/.test(word) && !/\s/.test(word);
}

export function sanitizeTeaser(teaser: { risk_word_public: string; lockedText: string }) {
  const risk_word_public = isValidRiskWord(teaser.risk_word_public) ? teaser.risk_word_public : FALLBACK_RISK_WORD;
  const lockedTextRaw = teaser.lockedText.trim();
  const lockedText = sanitizeText(lockedTextRaw || FALLBACK_LOCKED, 80);

  return {
    risk_word_public,
    lockedText: lockedText.slice(0, 80),
  };
}

export function sanitizeSummaryText(input: string) {
  return sanitizeText(input.trim(), 280);
}

export function sanitizeDetailText(input: string) {
  return sanitizeText(input.trim(), 420);
}

export function sanitizeCardMeaning(input: string) {
  return sanitizeText(input.trim(), 220);
}
