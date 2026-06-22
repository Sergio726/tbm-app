// Registry + catálogo de proveedores IA (JARVIS · S18.1).

import { anthropicProvider } from "./anthropic";
import type { AIProvider, ProviderId } from "./types";

export * from "./types";

export type ProviderMeta = {
  id: ProviderId;
  label: string;
  models: { id: string; label: string }[];
  implemented: boolean; // false = listado pero sin adapter todavía (S18.4)
};

export const PROVIDERS: ProviderMeta[] = [
  {
    id: "anthropic",
    label: "Anthropic (Claude)",
    implemented: true,
    models: [
      { id: "claude-opus-4-8", label: "Claude Opus 4.8 · calidad" },
      { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
      { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 · costo" },
    ],
  },
  {
    id: "openai",
    label: "OpenAI (ChatGPT)",
    implemented: false,
    models: [{ id: "gpt-4o", label: "GPT-4o" }],
  },
  {
    id: "google",
    label: "Google (Gemini)",
    implemented: false,
    models: [{ id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" }],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    implemented: false,
    models: [{ id: "deepseek-chat", label: "DeepSeek Chat" }],
  },
];

const REGISTRY: Partial<Record<ProviderId, AIProvider>> = {
  anthropic: anthropicProvider,
};

/** Devuelve el adapter del proveedor, o null si todavía no está implementado. */
export function getProvider(id: ProviderId): AIProvider | null {
  return REGISTRY[id] ?? null;
}

export function providerMeta(id: ProviderId): ProviderMeta | undefined {
  return PROVIDERS.find((p) => p.id === id);
}
