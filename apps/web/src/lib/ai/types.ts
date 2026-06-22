// Capa de abstracción IA (JARVIS). Server-only.
// NOTA: copia de apps/admin/src/lib/ai/. Deuda: unificar en packages/shared.

export type ProviderId = "openrouter" | "anthropic" | "openai" | "google" | "deepseek";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatOptions = {
  model: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
};

export interface AIProvider {
  id: ProviderId;
  chat(opts: ChatOptions, apiKey: string): Promise<string>;
}

export class AIError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AIError";
    this.status = status;
  }
}
