// Registry + catálogo de proveedores IA (JARVIS · S18.1 / S18.1b).

import { anthropicProvider } from "./anthropic";
import { openrouterProvider } from "./openrouter";
import type { AIProvider, ProviderId } from "./types";

export * from "./types";

export type ProviderMeta = {
  id: ProviderId;
  label: string;
  models: { id: string; label: string }[];
  implemented: boolean;
  allowCustomModel?: boolean; // true = el modelo se escribe libre (OpenRouter)
  hint?: string;
};

export const PROVIDERS: ProviderMeta[] = [
  {
    id: "openrouter",
    label: "OpenRouter (multi-LLM) · recomendado",
    implemented: true,
    allowCustomModel: true,
    hint: "Un endpoint y una key dan acceso a toda la gama. Modelo = slug de openrouter.ai/models.",
    models: [
      { id: "anthropic/claude-3.5-haiku", label: "Claude 3.5 Haiku · económico" },
      { id: "anthropic/claude-opus-4", label: "Claude Opus 4 · calidad" },
      { id: "openai/gpt-4o", label: "GPT-4o (OpenAI)" },
      { id: "openai/gpt-4o-mini", label: "GPT-4o mini · económico" },
      { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (Google)" },
      { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash · económico" },
      { id: "deepseek/deepseek-chat", label: "DeepSeek Chat · económico" },
      { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B (Meta)" },
    ],
  },
  {
    id: "anthropic",
    label: "Anthropic (Claude) · directo",
    implemented: true,
    models: [
      { id: "claude-opus-4-8", label: "Claude Opus 4.8 · calidad" },
      { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
      { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 · costo" },
    ],
  },
];

const REGISTRY: Partial<Record<ProviderId, AIProvider>> = {
  openrouter: openrouterProvider,
  anthropic: anthropicProvider,
};

/** Devuelve el adapter del proveedor, o null si todavía no está implementado. */
export function getProvider(id: ProviderId): AIProvider | null {
  return REGISTRY[id] ?? null;
}

export function providerMeta(id: ProviderId): ProviderMeta | undefined {
  return PROVIDERS.find((p) => p.id === id);
}
