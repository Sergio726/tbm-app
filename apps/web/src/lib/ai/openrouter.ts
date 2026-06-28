// Adapter OpenRouter (multi-LLM). Copia de apps/admin/src/lib/ai/openrouter.ts.

import {
  AIError,
  parseSSE,
  type AIProvider,
  type ChatOptions,
  type ChatResult,
  type ToolSpec,
} from "./types";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

const HEADERS = (apiKey: string) => ({
  "content-type": "application/json",
  authorization: `Bearer ${apiKey}`,
  "HTTP-Referer": "https://tbm-app-seven.vercel.app",
  "X-Title": "The Business Multiplier",
});

export const openrouterProvider: AIProvider = {
  id: "openrouter",
  async chat(opts: ChatOptions, apiKey: string): Promise<string> {
    const messages = opts.messages.map((m) => ({ role: m.role, content: m.content }));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS(apiKey),
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

  async *chatStream(opts: ChatOptions, apiKey: string): AsyncIterable<string> {
    const messages = opts.messages.map((m) => ({ role: m.role, content: m.content }));
    const res = await fetch(API_URL, {
      method: "POST",
      headers: HEADERS(apiKey),
      body: JSON.stringify({
        model: opts.model,
        max_tokens: opts.maxTokens ?? 1024,
        temperature: opts.temperature ?? 0.7,
        stream: true,
        messages,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new AIError(res.status, body || `HTTP ${res.status}`);
    }
    for await (const ev of parseSSE(res)) {
      const token = (ev as { choices?: { delta?: { content?: string } }[] })?.choices?.[0]?.delta
        ?.content;
      if (token) yield token;
    }
  },

  // DC-3: un turno con tools (formato OpenAI). No-streaming.
  async chatWithTools(
    opts: ChatOptions & { tools: ToolSpec[] },
    apiKey: string
  ): Promise<ChatResult> {
    const messages = opts.messages.map((m) => ({ role: m.role, content: m.content }));
    const tools = opts.tools.map((t) => ({
      type: "function",
      function: { name: t.name, description: t.description, parameters: t.parameters },
    }));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS(apiKey),
        body: JSON.stringify({
          model: opts.model,
          max_tokens: opts.maxTokens ?? 1024,
          temperature: opts.temperature ?? 0.7,
          messages,
          tools,
          tool_choice: "auto",
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new AIError(res.status, body || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as {
        choices?: {
          message?: {
            content?: string;
            tool_calls?: { id?: string; function?: { name?: string; arguments?: string } }[];
          };
        }[];
      };
      const msg = data.choices?.[0]?.message;
      const text = (msg?.content ?? "").trim();
      const call = msg?.tool_calls?.[0];
      if (call?.function?.name) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch {
          /* args inválidos → objeto vacío */
        }
        return {
          text,
          toolCall: { id: call.id || call.function.name, name: call.function.name, arguments: args },
        };
      }
      return { text };
    } finally {
      clearTimeout(timeout);
    }
  },
};
