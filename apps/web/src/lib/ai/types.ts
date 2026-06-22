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
  /** Stream de tokens (S18.3). Opcional: el caller cae a chat() si no existe. */
  chatStream?(opts: ChatOptions, apiKey: string): AsyncIterable<string>;
}

/** Parser incremental de líneas SSE "data: {...}" → JSON por línea de datos. */
export async function* parseSSE(res: Response): AsyncIterable<unknown> {
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const line of parts) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]" || data === "") continue;
      try {
        yield JSON.parse(data);
      } catch {
        /* línea parcial/keep-alive → ignorar */
      }
    }
  }
}

export class AIError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AIError";
    this.status = status;
  }
}
