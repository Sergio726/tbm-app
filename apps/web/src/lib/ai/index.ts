// Registry de proveedores IA (JARVIS). Copia de apps/admin/src/lib/ai/index.ts
// (solo el factory; el catálogo de UI vive en el admin).

import { anthropicProvider } from "./anthropic";
import { openrouterProvider } from "./openrouter";
import type { AIProvider, ProviderId } from "./types";

export * from "./types";

const REGISTRY: Partial<Record<ProviderId, AIProvider>> = {
  openrouter: openrouterProvider,
  anthropic: anthropicProvider,
};

export function getProvider(id: ProviderId): AIProvider | null {
  return REGISTRY[id] ?? null;
}
