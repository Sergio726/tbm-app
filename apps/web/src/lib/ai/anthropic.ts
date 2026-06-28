// Adapter Anthropic (Claude). Raw fetch. Copia de apps/admin/src/lib/ai/anthropic.ts.

import {
  AIError,
  parseSSE,
  type AIProvider,
  type ChatOptions,
  type ChatResult,
  type ToolSpec,
} from "./types";

const API_URL = "https://api.anthropic.com/v1/messages";

function splitSystem(opts: ChatOptions) {
  const system = opts.messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const messages = opts.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  return { system, messages };
}

const HEADERS = (apiKey: string) => ({
  "content-type": "application/json",
  "x-api-key": apiKey,
  "anthropic-version": "2023-06-01",
});

export const anthropicProvider: AIProvider = {
  id: "anthropic",
  async chat(opts: ChatOptions, apiKey: string): Promise<string> {
    const { system, messages } = splitSystem(opts);
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

  async *chatStream(opts: ChatOptions, apiKey: string): AsyncIterable<string> {
    const { system, messages } = splitSystem(opts);
    const res = await fetch(API_URL, {
      method: "POST",
      headers: HEADERS(apiKey),
      body: JSON.stringify({
        model: opts.model,
        max_tokens: opts.maxTokens ?? 1024,
        temperature: opts.temperature ?? 0.7,
        ...(system ? { system } : {}),
        stream: true,
        messages,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new AIError(res.status, body || `HTTP ${res.status}`);
    }
    for await (const ev of parseSSE(res)) {
      const e = ev as { type?: string; delta?: { type?: string; text?: string } };
      if (e.type === "content_block_delta" && e.delta?.type === "text_delta" && e.delta.text) {
        yield e.delta.text;
      }
    }
  },

  // DC-3: un turno con tools (formato Anthropic: tool_use como content block). No-streaming.
  async chatWithTools(
    opts: ChatOptions & { tools: ToolSpec[] },
    apiKey: string
  ): Promise<ChatResult> {
    const { system, messages } = splitSystem(opts);
    const tools = opts.tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters,
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
          ...(system ? { system } : {}),
          messages,
          tools,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new AIError(res.status, body || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as {
        content?: {
          type: string;
          text?: string;
          id?: string;
          name?: string;
          input?: Record<string, unknown>;
        }[];
      };
      const blocks = data.content ?? [];
      const text = blocks
        .filter((b) => b.type === "text" && b.text)
        .map((b) => b.text!.trim())
        .join("\n\n")
        .trim();
      const use = blocks.find((b) => b.type === "tool_use" && b.name);
      if (use?.name) {
        return {
          text,
          toolCall: { id: use.id || use.name, name: use.name, arguments: use.input ?? {} },
        };
      }
      return { text };
    } finally {
      clearTimeout(timeout);
    }
  },
};
