// Adapter OpenRouter (JARVIS · S18.1b). Un solo endpoint compatible con OpenAI da
// acceso a toda la gama de LLMs (Claude, GPT, Gemini, DeepSeek, Llama…) eligiendo
// el modelo por su slug (p. ej. "anthropic/claude-3.5-haiku", "openai/gpt-4o").

import { AIError, type AIProvider, type ChatOptions } from "./types";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const openrouterProvider: AIProvider = {
  id: "openrouter",
  async chat(opts: ChatOptions, apiKey: string): Promise<string> {
    // Formato OpenAI: el `system` va inline como un mensaje role:"system".
    const messages = opts.messages.map((m) => ({ role: m.role, content: m.content }));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
          // Atribución recomendada por OpenRouter (opcional).
          "HTTP-Referer": "https://tbm-app-admin.vercel.app",
          "X-Title": "TBM Admin",
        },
        body: JSON.stringify({
          model: opts.model,
          max_tokens: opts.maxTokens ?? 1024,
          temperature: opts.temperature ?? 0.7,
          messages,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new AIError(res.status, body || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      return (data.choices?.[0]?.message?.content ?? "").trim();
    } finally {
      clearTimeout(timeout);
    }
  },
};
