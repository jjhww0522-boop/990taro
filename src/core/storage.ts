import { STORAGE_KEYS, type StorageKey } from "./storage-keys";
import type { PaymentBackupPayload, TeaserPayload } from "./types";

type Primitive = string | null;

const storageCache = new Map<StorageKey, Primitive>();

function hasWindow() {
  return typeof window !== "undefined";
}

function readRaw(key: StorageKey): Primitive {
  if (!hasWindow()) return null;
  if (storageCache.has(key)) return storageCache.get(key) ?? null;

  const value = window.localStorage.getItem(key);
  storageCache.set(key, value);
  return value;
}

function writeRaw(key: StorageKey, value: Primitive) {
  if (!hasWindow()) return;
  if (value === null) {
    window.localStorage.removeItem(key);
    storageCache.delete(key);
    return;
  }
  window.localStorage.setItem(key, value);
  storageCache.set(key, value);
}

function readJson<T>(key: StorageKey): T | null {
  const raw = readRaw(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson<T>(key: StorageKey, value: T | null) {
  if (value === null) {
    writeRaw(key, null);
    return;
  }
  writeRaw(key, JSON.stringify(value));
}

export const tarotStorage = {
  getMessages() {
    return readJson<string[]>(STORAGE_KEYS.messages) ?? [];
  },
  setMessages(messages: string[]) {
    writeJson(STORAGE_KEYS.messages, messages);
  },
  getTaxonomy() {
    return readJson<Record<string, unknown>>(STORAGE_KEYS.taxonomy);
  },
  setTaxonomy(value: Record<string, unknown>) {
    writeJson(STORAGE_KEYS.taxonomy, value);
  },
  getTeaser() {
    return readJson<TeaserPayload>(STORAGE_KEYS.teaser);
  },
  setTeaser(teaser: TeaserPayload | null) {
    if (!teaser) {
      writeJson(STORAGE_KEYS.teaser, null);
      return;
    }
    writeJson(STORAGE_KEYS.teaser, {
      ...teaser,
      lockedText: teaser.lockedText.slice(0, 80),
    });
  },
  getPaymentBackup() {
    return readJson<PaymentBackupPayload>(STORAGE_KEYS.payment);
  },
  setPaymentBackup(payload: PaymentBackupPayload | null) {
    writeJson(STORAGE_KEYS.payment, payload);
  },
  getEntitlementJwt() {
    return readRaw(STORAGE_KEYS.entitlementJwt);
  },
  setEntitlementJwt(jwt: string | null) {
    writeRaw(STORAGE_KEYS.entitlementJwt, jwt);
  },
  getRateLimitNotifiedKst() {
    return readRaw(STORAGE_KEYS.rateLimitNotifiedKst);
  },
  setRateLimitNotifiedKst(kstDate: string | null) {
    writeRaw(STORAGE_KEYS.rateLimitNotifiedKst, kstDate);
  },
  getLastFreeUsedDate() {
    return readRaw(STORAGE_KEYS.lastFreeUsedDate);
  },
  setLastFreeUsedDate(kstDate: string | null) {
    writeRaw(STORAGE_KEYS.lastFreeUsedDate, kstDate);
  },
};
