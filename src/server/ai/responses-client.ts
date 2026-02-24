import { FIXED_PROMPT_PREFIX } from "./prompt-prefix";

type ResponsesJsonSchema = {
  type: "object";
  [key: string]: unknown;
};

type RunStructuredOptions = {
  model: string;
  schemaName: string;
  schema: ResponsesJsonSchema;
  dynamicPrompt: string;
  maxOutputTokens: number;
  endpointLabel: "free" | "paid_summary" | "paid_detail";
};

type ResponsesApiResult = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
};

function extractOutputText(raw: ResponsesApiResult) {
  if (raw.output_text) return raw.output_text;
  const chunks = raw.output ?? [];
  const texts: string[] = [];
  for (const chunk of chunks) {
    const contents = chunk.content ?? [];
    for (const item of contents) {
      if (item.type === "output_text" && item.text) {
        texts.push(item.text);
      }
    }
  }
  return texts.join("").trim();
}

function getOpenAiApiKey() {
  const key = process.env.OPENAI_API_KEY ?? "";
  if (!key) throw new Error("OPENAI_API_KEY is required.");
  return key;
}

async function callResponsesApi(payload: Record<string, unknown>) {
  const startedAt = Date.now();
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getOpenAiApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const latencyMs = Date.now() - startedAt;
  const raw = (await res.json().catch(() => ({}))) as ResponsesApiResult & { error?: unknown };

  if (!res.ok) {
    console.error("[openai.responses] request failed", {
      status: res.status,
      latencyMs,
      error: raw.error ?? null,
    });
    throw new Error("OpenAI Responses API request failed.");
  }

  return { raw, latencyMs };
}

export async function runStructuredOutput<T>(opts: RunStructuredOptions) {
  const payload = {
    model: opts.model,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: FIXED_PROMPT_PREFIX,
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: opts.dynamicPrompt,
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: opts.schemaName,
        strict: true,
        schema: opts.schema,
      },
    },
    max_output_tokens: opts.maxOutputTokens,
  };

  const { raw, latencyMs } = await callResponsesApi(payload);
  const outputText = extractOutputText(raw);
  if (!outputText) throw new Error("Empty structured output from OpenAI.");

  const parsed = JSON.parse(outputText) as T;
  console.info("[openai.responses] metrics", {
    endpoint: opts.endpointLabel,
    model: opts.model,
    latencyMs,
    usage: raw.usage ?? null,
  });

  return {
    parsed,
    usage: raw.usage,
  };
}
