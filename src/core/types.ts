export type BootstrapResponse = {
  todayKst: string;
  budgetExhausted: boolean;
  maintenanceMode: boolean;
};

export type TeaserPayload = {
  risk_word_public: string;
  lockedText: string;
};

export type PaymentBackupPayload = {
  state: "PAYMENT_IN_PROGRESS";
  pendingOrderId: string;
  backupMessages: string[];
  teaserBackup: TeaserPayload | null;
  backupAtKst: string;
};

export type VerifyPaymentResponse = {
  paid: boolean;
  entitlementJwt?: string;
  sessionInitStatus?: "ok" | "degraded";
  sid?: string;
  degradedMode?: boolean;
};

export type ApiErrorPayload = {
  errorCode?: string;
  message?: string;
};

export type FreeTarotResponse = {
  spread: string[];
  teaser: TeaserPayload;
};
