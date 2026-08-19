import { log } from "../logger";

export type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

export type AiResult = {
  text: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  estimatedCost: number;
  provider: string;
};

export interface AiProvider {
  name: string;
  complete(messages: ChatTurn[]): Promise<AiResult>;
}

class OpenAiCompatibleProvider implements AiProvider {
  name = process.env.AI_PROVIDER || "openai";
  async complete(messages: ChatTurn[]): Promise<AiResult> {
    const key = process.env.AI_API_KEY;
    if (!key) throw new Error("missing_ai_key");
    const model = process.env.AI_MODEL || "gpt-4o-mini";
    const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 500 }),
    });
    if (!res.ok) {
      const body = await res.text();
      log("AI", "provider_error", { status: res.status, body: body.slice(0, 400) });
      throw new Error("ai_provider_failed");
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const text = data.choices?.[0]?.message?.content?.trim() || "";
    const tokensIn = data.usage?.prompt_tokens ?? 0;
    const tokensOut = data.usage?.completion_tokens ?? 0;
    const estimatedCost = (tokensIn * 0.15 + tokensOut * 0.6) / 1_000_000;
    return { text, model, tokensIn, tokensOut, estimatedCost, provider: this.name };
  }
}

export function getAiProvider(): AiProvider | null {
  if (!process.env.AI_API_KEY) return null;
  return new OpenAiCompatibleProvider();
}
