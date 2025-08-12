export interface ModelOption {
  value: string;
  label: string;
  provider: "OpenAI" | "Anthropic" | "Google";
}

export const MODEL_LIST: ModelOption[] = [
  // OpenAI Models
  { value: "o3", label: "o3", provider: "OpenAI" },
  { value: "o3-mini", label: "o3 Mini", provider: "OpenAI" },
  { value: "o3-pro", label: "o3 Pro", provider: "OpenAI" },
  { value: "o4-mini", label: "o4 Mini", provider: "OpenAI" },
  { value: "gpt-4.1", label: "GPT-4.1", provider: "OpenAI" },
  { value: "gpt-4o", label: "GPT-4o", provider: "OpenAI" },

  // Anthropic Models
  { value: "claude-opus-4.1", label: "Claude Opus 4.1", provider: "Anthropic" },
  { value: "claude-sonnet-4", label: "Claude Sonnet 4", provider: "Anthropic" },
  {
    value: "claude-haiku-3.5",
    label: "Claude Haiku 3.5",
    provider: "Anthropic",
  },

  // Google Gemini Models
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "Google" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "Google" },
];

// Group models by provider for better organization
export const MODELS_BY_PROVIDER = MODEL_LIST.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ModelOption[]>,
);
