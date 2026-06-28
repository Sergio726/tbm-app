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

// ── Tool use / function calling (DC-3) ────────────────────────────────────
/** Esquema de parámetros de una herramienta (subset JSON Schema, común a OpenAI/Anthropic). */
export type ToolParams = {
  type: "object";
  properties: Record<string, { type: string; description: string; enum?: string[] }>;
  required?: string[];
};

/** Definición de una herramienta que el modelo puede pedir ejecutar. */
export type ToolSpec = {
  name: string;
  description: string;
  parameters: ToolParams;
};

/** Pedido del modelo de ejecutar una herramienta. */
export type ToolCall = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
};

/** Tokens consumidos en un turno (DC-6, base de costos). */
export type TokenUsage = { promptTokens: number; completionTokens: number };

/** Estimación de tokens cuando el proveedor no la devuelve (~4 chars/token). */
export function estimateTokens(s: string): number {
  return Math.max(0, Math.ceil((s || "").length / 4));
}

/** Resultado de un turno con tools: texto y/o un pedido de herramienta. */
export type ChatResult = {
  text: string;
  toolCall?: ToolCall;
  usage?: TokenUsage;
};

export interface AIProvider {
  id: ProviderId;
  chat(opts: ChatOptions, apiKey: string): Promise<string>;
  /**
   * Stream de tokens (S18.3). Yieldea texto y, al terminar, `return`-ea el uso de
   * tokens (DC-6) — el caller lo captura iterando manual hasta `done`.
   * Opcional: el caller cae a chat() si no existe.
   */
  chatStream?(opts: ChatOptions, apiKey: string): AsyncGenerator<string, TokenUsage | undefined, void>;
  /**
   * Un turno con herramientas disponibles (DC-3, no-streaming). Devuelve texto
   * libre y/o un único toolCall. El caller decide si ejecutar (con confirmación).
   * Opcional: si no existe, el caller cae al chat normal sin acciones.
   */
  chatWithTools?(
    opts: ChatOptions & { tools: ToolSpec[] },
    apiKey: string
  ): Promise<ChatResult>;
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
