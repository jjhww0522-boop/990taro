export const STORAGE_KEYS = {
  messages: "tarot.v1.messages",
  taxonomy: "tarot.v1.taxonomy",
  teaser: "tarot.v1.teaser",
  payment: "tarot.v1.payment",
  entitlementJwt: "tarot.v1.entitlementJwt",
  rateLimitNotifiedKst: "tarot.v1.ui.rateLimitNotifiedKst",
  lastFreeUsedDate: "tarot.v1.ui.lastFreeUsedDate",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
