// Adapter Anthropic (Claude). Raw fetch. Copia de apps/admin/src/lib/ai/anthropic.ts.

import {
  AIError,
  parseSSE,
  type AIProvider,
  type ChatOptions,
  type ChatResult,
  type ToolSpec,
  type TokenUsage,
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

  async *chatStream(
    opts: ChatOptions,
    apiKey: string
  ): AsyncGenerator<string, TokenUsage | undefined, void> {
    const { system, messages } = splitSystem(opts);
    // IA-3: idle-timeout entre chunks (se rearma en cada evento). Sin esto un
    // stream colgado del proveedor deja la función serverless viva hasta el
    // hard-limit de Vercel.
    const controller = new AbortController();
    const IDLE_MS = 30000;
    let timer: ReturnType<typeof setTimeout> = setTimeout(() => controller.abort(), IDLE_MS);
    const rearm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => controller.abort(), IDLE_MS);
    };
    try {
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
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new AIError(res.status, body || `HTTP ${res.status}`);
      }
      // DC-6: input_tokens vienen en message_start; output_tokens (acumulado) en message_delta.
      let promptTokens = 0;
      let completionTokens = 0;
      for await (const ev of parseSSE(res)) {
        rearm();
        const e = ev as {
          type?: string;
          delta?: { type?: string; text?: string };
          message?: { usage?: { input_tokens?: number; output_tokens?: number } };
          usage?: { input_tokens?: number; output_tokens?: number };
        };
        if (e.type === "message_start" && e.message?.usage) {
          promptTokens = e.message.usage.input_tokens ?? 0;
          completionTokens = e.message.usage.output_tokens ?? 0;
        }
        if (e.type === "content_block_delta" && e.delta?.type === "text_delta" && e.delta.text) {
          yield e.delta.text;
        }
        if (e.type === "message_delta" && e.usage) {
          if (typeof e.usage.output_tokens === "number") completionTokens = e.usage.output_tokens;
          if (typeof e.usage.input_tokens === "number") promptTokens = e.usage.input_tokens;
        }
      }
      return promptTokens || completionTokens ? { promptTokens, completionTokens } : undefined;
    } finally {
      clearTimeout(timer);
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
        usage?: { input_tokens?: number; output_tokens?: number };
      };
      const blocks = data.content ?? [];
      const text = blocks
        .filter((b) => b.type === "text" && b.text)
        .map((b) => b.text!.trim())
        .join("\n\n")
        .trim();
      const usage: TokenUsage | undefined = data.usage
        ? {
            promptTokens: data.usage.input_tokens ?? 0,
            completionTokens: data.usage.output_tokens ?? 0,
          }
        : undefined;
      const use = blocks.find((b) => b.type === "tool_use" && b.name);
      if (use?.name) {
        return {
          text,
          usage,
          toolCall: { id: use.id || use.name, name: use.name, arguments: use.input ?? {} },
        };
      }
      return { text, usage };
    } finally {
      clearTimeout(timeout);
    }
  },
};
