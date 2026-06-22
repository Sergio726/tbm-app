// Capa de abstracción IA (JARVIS · S18.1). Server-only.
// La app nunca habla con un SDK concreto: cada proveedor implementa AIProvider.
// En S18.2 esto se promueve a packages/shared cuando la web necesite el chat.

export type ProviderId = "anthropic" | "openai" | "google" | "deepseek";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatOptions = {
  model: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
};

export interface AIProvider {
  id: ProviderId;
  /** Devuelve el texto de la respuesta. Lanza AIError si el proveedor falla. */
  chat(opts: ChatOptions, apiKey: string): Promise<string>;
}

/** Error normalizado de un proveedor (status HTTP + cuerpo). */
export class AIError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AIError";
    this.status = status;
  }
}
