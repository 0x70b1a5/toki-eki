import { PROMPT_GENERATION_PROMPT } from "./constants";

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}

export interface TranslationResult {
  translation: string;
  usage: TokenUsage;
}

export interface PromptGenerationResult {
  autonym: string;
  prompt: string;
  usage: TokenUsage;
}

export type ApiResult<T> = T | { error: string };

export function isApiError<T>(
  result: ApiResult<T>
): result is { error: string } {
  return "error" in result;
}

export type ProviderId = "claude" | "openai" | "gemini" | "ollama";

// ── Low-level request helpers ──────────────────────────────────────

async function claudeRequest(
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  model: string
): Promise<ApiResult<{ text: string; usage: TokenUsage }>> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    return { error: `API error ${response.status}: ${await response.text()}` };
  }

  const data = await response.json();
  return {
    text: data.content?.[0]?.type === "text" ? data.content[0].text : "",
    usage: {
      input_tokens: data.usage?.input_tokens ?? 0,
      output_tokens: data.usage?.output_tokens ?? 0,
    },
  };
}

async function openaiRequest(
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  model: string,
  baseUrl = "https://api.openai.com/v1"
): Promise<ApiResult<{ text: string; usage: TokenUsage }>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    return { error: `API error ${response.status}: ${await response.text()}` };
  }

  const data = await response.json();
  return {
    text: data.choices?.[0]?.message?.content ?? "",
    usage: {
      input_tokens: data.usage?.prompt_tokens ?? 0,
      output_tokens: data.usage?.completion_tokens ?? 0,
    },
  };
}

async function geminiRequest(
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  model: string
): Promise<ApiResult<{ text: string; usage: TokenUsage }>> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userMessage }] }],
      generationConfig: { maxOutputTokens: 1024 },
    }),
  });

  if (!response.ok) {
    return { error: `API error ${response.status}: ${await response.text()}` };
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const meta = data.usageMetadata ?? {};
  return {
    text,
    usage: {
      input_tokens: meta.promptTokenCount ?? 0,
      output_tokens: meta.candidatesTokenCount ?? 0,
    },
  };
}

// ── Provider dispatch ──────────────────────────────────────────────

function providerRequest(
  provider: ProviderId,
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  model: string,
  ollamaUrl?: string
): Promise<ApiResult<{ text: string; usage: TokenUsage }>> {
  switch (provider) {
    case "claude":
      return claudeRequest(systemPrompt, userMessage, apiKey, model);
    case "openai":
      return openaiRequest(systemPrompt, userMessage, apiKey, model);
    case "gemini":
      return geminiRequest(systemPrompt, userMessage, apiKey, model);
    case "ollama":
      return openaiRequest(
        systemPrompt,
        userMessage,
        "",
        model,
        `${ollamaUrl || "http://localhost:11434"}/v1`
      );
  }
}

// ── Public API ─────────────────────────────────────────────────────

export async function translate(
  provider: ProviderId,
  text: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  ollamaUrl?: string
): Promise<ApiResult<TranslationResult>> {
  if (!apiKey && provider !== "ollama") {
    return { error: "No API key configured. Open the toki eki popup to set one." };
  }
  if (!text.trim()) {
    return { error: "Empty text" };
  }

  try {
    const result = await providerRequest(
      provider, systemPrompt, text, apiKey, model, ollamaUrl
    );
    if (isApiError(result)) return result;
    return { translation: result.text, usage: result.usage };
  } catch (err) {
    return {
      error: `Network error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function generatePrompt(
  provider: ProviderId,
  language: string,
  apiKey: string,
  model: string,
  ollamaUrl?: string
): Promise<ApiResult<PromptGenerationResult>> {
  if (!apiKey && provider !== "ollama") {
    return { error: "No API key configured" };
  }

  try {
    const result = await providerRequest(
      provider, PROMPT_GENERATION_PROMPT, language, apiKey, model, ollamaUrl
    );
    if (isApiError(result)) return result;

    const raw = result.text;
    if (!raw.trim()) return { error: "Empty response from model" };

    const lines = raw.split("\n");
    const autonym = lines[0].trim();
    const prompt = lines.slice(1).join("\n").trim();

    if (!autonym || !prompt) {
      return { error: "Could not parse autonym and prompt from response" };
    }

    return { autonym, prompt, usage: result.usage };
  } catch (err) {
    return {
      error: `Network error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
