const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function getTodayKst() {
  const kstMs = Date.now() + KST_OFFSET_MS;
  const day = Math.floor(kstMs / DAY_MS);
  const dayStartMs = day * DAY_MS;
  const date = new Date(dayStartMs - KST_OFFSET_MS);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function secondsUntilNextKstDay() {
  const kstMs = Date.now() + KST_OFFSET_MS;
  const nextDayStartKstMs = (Math.floor(kstMs / DAY_MS) + 1) * DAY_MS;
  return Math.max(1, Math.ceil((nextDayStartKstMs - kstMs) / 1000));
}

export function getCurrentKstMonth() {
  const kstMs = Date.now() + KST_OFFSET_MS;
  const date = new Date(kstMs);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
