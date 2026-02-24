import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { ApiError, tarotApi } from "../core/api";
import { tarotStorage } from "../core/storage";
import type { BootstrapResponse, PaymentBackupPayload, TeaserPayload } from "../core/types";

type CoreState = {
  todayKst: string;
  budgetExhausted: boolean;
  maintenanceMode: boolean;
  messages: string[];
  teaser: TeaserPayload | null;
  entitlementJwt: string | null;
  freeAvailable: boolean;
  inputDisabled: boolean;
  inputPlaceholder: string;
  inputTooltip: string;
  rateLimitModalOpen: boolean;
  chatReadOnly: boolean;
  showSessionDissolvedPanel: boolean;
};

type Action =
  | { type: "BOOTSTRAP_LOADED"; payload: BootstrapResponse }
  | { type: "RESTORE_LOCAL"; payload: Pick<CoreState, "messages" | "teaser" | "entitlementJwt"> }
  | { type: "FREE_USED"; payload: { todayKst: string } }
  | { type: "RATE_LIMIT_LOCK"; payload: { showModal: boolean } }
  | { type: "CLOSE_RATE_LIMIT_MODAL" }
  | { type: "SESSION_DISSOLVED" }
  | { type: "PAYMENT_RECOVERY_FAILED"; payload: { messages: string[]; teaser: TeaserPayload | null } }
  | { type: "PAYMENT_RECOVERED"; payload: { entitlementJwt: string; messages: string[]; teaser: TeaserPayload | null } };

const DEFAULT_PLACEHOLDER = "질문을 입력하세요";
const RATE_LIMIT_PLACEHOLDER = "오늘은 잠시 숨을 고르는 날이에요";

function initialState(): CoreState {
  const messages = tarotStorage.getMessages();
  const teaser = tarotStorage.getTeaser();
  const entitlementJwt = tarotStorage.getEntitlementJwt();

  return {
    todayKst: "",
    budgetExhausted: false,
    maintenanceMode: false,
    messages,
    teaser,
    entitlementJwt,
    freeAvailable: false,
    inputDisabled: false,
    inputPlaceholder: DEFAULT_PLACEHOLDER,
    inputTooltip: "",
    rateLimitModalOpen: false,
    chatReadOnly: false,
    showSessionDissolvedPanel: false,
  };
}

function reducer(state: CoreState, action: Action): CoreState {
  switch (action.type) {
    case "BOOTSTRAP_LOADED": {
      const lastFreeUsedDate = tarotStorage.getLastFreeUsedDate();
      const freeAvailable = Boolean(action.payload.todayKst) && lastFreeUsedDate !== action.payload.todayKst;
      const rateLimitNotified = tarotStorage.getRateLimitNotifiedKst();
      const isRateLimitedToday = rateLimitNotified === action.payload.todayKst;

      return {
        ...state,
        todayKst: action.payload.todayKst,
        budgetExhausted: action.payload.budgetExhausted,
        maintenanceMode: action.payload.maintenanceMode,
        freeAvailable,
        inputDisabled: isRateLimitedToday || action.payload.maintenanceMode,
        inputPlaceholder: isRateLimitedToday ? RATE_LIMIT_PLACEHOLDER : DEFAULT_PLACEHOLDER,
        inputTooltip: isRateLimitedToday ? "오늘 무료 흐름이 모두 소진되었어요" : "",
      };
    }
    case "RESTORE_LOCAL":
      return {
        ...state,
        messages: action.payload.messages,
        teaser: action.payload.teaser,
        entitlementJwt: action.payload.entitlementJwt,
      };
    case "FREE_USED":
      return {
        ...state,
        freeAvailable: false,
        todayKst: action.payload.todayKst,
      };
    case "RATE_LIMIT_LOCK":
      return {
        ...state,
        rateLimitModalOpen: action.payload.showModal,
        inputDisabled: true,
        inputPlaceholder: RATE_LIMIT_PLACEHOLDER,
        inputTooltip: "오늘 무료 흐름이 모두 소진되었어요",
      };
    case "CLOSE_RATE_LIMIT_MODAL":
      return {
        ...state,
        rateLimitModalOpen: false,
      };
    case "SESSION_DISSOLVED":
      return {
        ...state,
        showSessionDissolvedPanel: true,
        chatReadOnly: true,
      };
    case "PAYMENT_RECOVERED":
      return {
        ...state,
        entitlementJwt: action.payload.entitlementJwt,
        messages: action.payload.messages,
        teaser: action.payload.teaser,
        chatReadOnly: false,
        showSessionDissolvedPanel: false,
      };
    case "PAYMENT_RECOVERY_FAILED":
      return {
        ...state,
        entitlementJwt: null,
        messages: action.payload.messages,
        teaser: action.payload.teaser,
      };
    default:
      return state;
  }
}

function isSessionDissolved(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 401 || error.status === 403) return true;
  return error.errorCode === "SESSION_DISSOLVED";
}

type UseTarotCoreOptions = {
  onUnlockReady?: () => void;
};

export function useTarotCore(options: UseTarotCoreOptions = {}) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const onUnlockReadyRef = useRef(options.onUnlockReady);

  useEffect(() => {
    onUnlockReadyRef.current = options.onUnlockReady;
  }, [options.onUnlockReady]);

  const bootstrap = useCallback(async () => {
    const bootstrapData = await tarotApi.getBootstrap();
    dispatch({ type: "BOOTSTRAP_LOADED", payload: bootstrapData });
    return bootstrapData;
  }, []);

  useEffect(() => {
    dispatch({
      type: "RESTORE_LOCAL",
      payload: {
        messages: tarotStorage.getMessages(),
        teaser: tarotStorage.getTeaser(),
        entitlementJwt: tarotStorage.getEntitlementJwt(),
      },
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await bootstrap();

      const paymentBackup = tarotStorage.getPaymentBackup();
      if (!paymentBackup || paymentBackup.state !== "PAYMENT_IN_PROGRESS") return;

      try {
        const verifyResult = await tarotApi.verifyPayment({ orderId: paymentBackup.pendingOrderId });
        if (!verifyResult.paid || !verifyResult.entitlementJwt) {
          if (cancelled) return;
          tarotStorage.setEntitlementJwt(null);
          tarotStorage.setMessages(paymentBackup.backupMessages);
          tarotStorage.setTeaser(paymentBackup.teaserBackup);
          tarotStorage.setPaymentBackup(null);
          dispatch({
            type: "PAYMENT_RECOVERY_FAILED",
            payload: {
              messages: paymentBackup.backupMessages,
              teaser: paymentBackup.teaserBackup,
            },
          });
          return;
        }
        if (cancelled) return;

        tarotStorage.setEntitlementJwt(verifyResult.entitlementJwt);
        tarotStorage.setMessages(paymentBackup.backupMessages);
        tarotStorage.setTeaser(paymentBackup.teaserBackup);
        tarotStorage.setPaymentBackup(null);

        dispatch({
          type: "PAYMENT_RECOVERED",
          payload: {
            entitlementJwt: verifyResult.entitlementJwt,
            messages: paymentBackup.backupMessages,
            teaser: paymentBackup.teaserBackup,
          },
        });

        onUnlockReadyRef.current?.();
      } catch {
        // Keep backup for next resume.
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [bootstrap]);

  const refreshBootstrapBeforeFreeSubmit = useCallback(async () => {
    return bootstrap();
  }, [bootstrap]);

  const submitFree = useCallback(
    async (question: string) => {
      let todayKstForAttempt = state.todayKst;
      try {
        const freshBootstrap = await refreshBootstrapBeforeFreeSubmit();
        todayKstForAttempt = freshBootstrap.todayKst;
        if (freshBootstrap.maintenanceMode) return null;

        const result = await tarotApi.submitFree({ question });
        tarotStorage.setTeaser(result.teaser);
        tarotStorage.setLastFreeUsedDate(freshBootstrap.todayKst);
        dispatch({ type: "FREE_USED", payload: { todayKst: freshBootstrap.todayKst } });
        return result;
      } catch (error) {
        if (error instanceof ApiError && error.status === 429) {
          const alreadyNotifiedToday = tarotStorage.getRateLimitNotifiedKst() === todayKstForAttempt;
          if (!alreadyNotifiedToday && todayKstForAttempt) {
            tarotStorage.setRateLimitNotifiedKst(todayKstForAttempt);
          }
          dispatch({
            type: "RATE_LIMIT_LOCK",
            payload: { showModal: !alreadyNotifiedToday },
          });
        }
        throw error;
      }
    },
    [refreshBootstrapBeforeFreeSubmit, state.todayKst],
  );

  const submitPaidSummary = useCallback(
    async (question: string) => {
      try {
        const jwt = state.entitlementJwt ?? tarotStorage.getEntitlementJwt();
        if (!jwt) {
          dispatch({ type: "SESSION_DISSOLVED" });
          return null;
        }
        return await tarotApi.submitPaidSummary({ question, entitlementJwt: jwt });
      } catch (error) {
        if (isSessionDissolved(error)) {
          dispatch({ type: "SESSION_DISSOLVED" });
          return null;
        }
        throw error;
      }
    },
    [state.entitlementJwt],
  );

  const submitPaidDetail = useCallback(async () => {
    try {
      const jwt = state.entitlementJwt ?? tarotStorage.getEntitlementJwt();
      if (!jwt) {
        dispatch({ type: "SESSION_DISSOLVED" });
        return null;
      }
      return await tarotApi.submitPaidDetail({ entitlementJwt: jwt });
    } catch (error) {
      if (isSessionDissolved(error)) {
        dispatch({ type: "SESSION_DISSOLVED" });
        return null;
      }
      throw error;
    }
  }, [state.entitlementJwt]);

  const closeRateLimitModal = useCallback(() => {
    dispatch({ type: "CLOSE_RATE_LIMIT_MODAL" });
  }, []);

  const markPaymentInProgress = useCallback(
    (pendingOrderId: string) => {
      const payload: PaymentBackupPayload = {
        state: "PAYMENT_IN_PROGRESS",
        pendingOrderId,
        backupMessages: state.messages,
        teaserBackup: state.teaser,
        backupAtKst: state.todayKst,
      };
      tarotStorage.setPaymentBackup(payload);
    },
    [state.messages, state.teaser, state.todayKst],
  );

  const sessionDissolvedCopy = useMemo(
    () => ({
      title: "지금은 기운이 흩어져 해석이 닿지 않아요",
      description: "잠시 흐름을 다시 맞추면 이어서 볼 수 있어요.",
      ctaLabel: "990원으로 다시 길을 열기",
    }),
    [],
  );

  return {
    state,
    actions: {
      bootstrap,
      submitFree,
      submitPaidSummary,
      submitPaidDetail,
      closeRateLimitModal,
      markPaymentInProgress,
    },
    sessionDissolvedCopy,
  };
}
