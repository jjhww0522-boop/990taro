import type {
  ApiErrorPayload,
  BootstrapResponse,
  FreeTarotResponse,
  VerifyPaymentResponse,
} from "./types";

export class ApiError extends Error {
  status: number;
  errorCode?: string;

  constructor(status: number, payload?: ApiErrorPayload) {
    super(payload?.message ?? "Request failed");
    this.status = status;
    this.errorCode = payload?.errorCode;
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch {
    return {} as T;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const payload = await parseJson<ApiErrorPayload>(res);
    throw new ApiError(res.status, payload);
  }

  return parseJson<T>(res);
}

export const tarotApi = {
  getBootstrap() {
    return request<BootstrapResponse>("/api/bootstrap", { method: "GET" });
  },
  verifyPayment(payload: { orderId: string }) {
    return request<VerifyPaymentResponse>("/api/verify-payment", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  submitFree(payload: { question: string }) {
    return request<FreeTarotResponse>("/api/tarot/free", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  submitPaidSummary(payload: { question: string; entitlementJwt: string }) {
    return request<unknown>("/api/tarot/paid-summary", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${payload.entitlementJwt}`,
      },
      body: JSON.stringify({ question: payload.question }),
    });
  },
  submitPaidDetail(payload: { entitlementJwt: string }) {
    return request<unknown>("/api/tarot/paid-detail", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${payload.entitlementJwt}`,
      },
    });
  },
};
