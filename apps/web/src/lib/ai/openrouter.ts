// Adapter OpenRouter (multi-LLM). Copia de apps/admin/src/lib/ai/openrouter.ts.

import { AIError, parseSSE, type AIProvider, type ChatOptions } from "./types";

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
};
