export const freeSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    spread: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          card: { type: "string", minLength: 1, maxLength: 40 },
          meaning: { type: "string", minLength: 1, maxLength: 200 },
        },
        required: ["card", "meaning"],
      },
    },
    teaser: {
      type: "object",
      additionalProperties: false,
      properties: {
        risk_word_public: { type: "string", pattern: "^[가-힣]{2,8}$" },
        lockedText: { type: "string", minLength: 1, maxLength: 80 },
      },
      required: ["risk_word_public", "lockedText"],
    },
  },
  required: ["spread", "teaser"],
} as const;

export const paidSummarySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    spread: {
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          card: { type: "string", minLength: 1, maxLength: 40 },
          meaning: { type: "string", minLength: 1, maxLength: 220 },
        },
        required: ["card", "meaning"],
      },
    },
    summary: { type: "string", minLength: 1, maxLength: 280 },
    teaser: {
      type: "object",
      additionalProperties: false,
      properties: {
        risk_word_public: { type: "string", pattern: "^[가-힣]{2,8}$" },
        lockedText: { type: "string", minLength: 1, maxLength: 80 },
      },
      required: ["risk_word_public", "lockedText"],
    },
  },
  required: ["spread", "summary", "teaser"],
} as const;

export const paidDetailSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    sections: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string", minLength: 1, maxLength: 40 },
          body: { type: "string", minLength: 1, maxLength: 420 },
        },
        required: ["title", "body"],
      },
    },
    closing: { type: "string", minLength: 1, maxLength: 140 },
  },
  required: ["sections", "closing"],
} as const;
