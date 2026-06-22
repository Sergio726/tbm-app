// Adapter Anthropic (Claude). Raw fetch — mismo patrón que apps/web/src/lib/ai-report.ts.
// Streaming se difiere a S18.2/S18.3.

import { AIError, type AIProvider, type ChatOptions } from "./types";

const API_URL = "https://api.anthropic.com/v1/messages";

export const anthropicProvider: AIProvider = {
  id: "anthropic",
  async chat(opts: ChatOptions, apiKey: string): Promise<string> {
    // Anthropic separa el system del array de mensajes.
    const system = opts.messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");
    const messages = opts.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: opts.model,
          max_tokens: opts.maxTokens ?? 1024,
          temperature: opts.temperature ?? 0.7,
          ...(system ? { system } : {}),
          messages,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new AIError(res.status, body || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as { content?: { type: string; text?: string }[] };
      return (data.content ?? [])
        .filter((b) => b.type === "text" && b.text)
        .map((b) => b.text!.trim())
        .join("\n\n")
        .trim();
    } finally {
      clearTimeout(timeout);
    }
  },
};
