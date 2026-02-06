import { PROMPT_GENERATION_PROMPT } from "./constants";

export interface ClaudeUsage {
  input_tokens: number;
  output_tokens: number;
}

export interface ClaudeResponse {
  translation: string;
  usage: ClaudeUsage;
}

export interface ClaudeErrorResponse {
  error: string;
}

export type ClaudeResult = ClaudeResponse | ClaudeErrorResponse;

export function isClaudeError(
  result: ClaudeResult
): result is ClaudeErrorResponse {
  return "error" in result;
}

export async function translateWithClaude(
  text: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  fetchFn: typeof fetch = fetch
): Promise<ClaudeResult> {
  if (!apiKey) {
    return { error: "No API key configured" };
  }

  if (!text.trim()) {
    return { error: "Empty text" };
  }

  try {
    const response = await fetchFn("https://api.anthropic.com/v1/messages", {
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
        messages: [{ role: "user", content: text }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        error: `API error ${response.status}: ${errorBody}`,
      };
    }

    const data = await response.json();

    const translatedText =
      data.content?.[0]?.type === "text" ? data.content[0].text : "";

    return {
      translation: translatedText,
      usage: {
        input_tokens: data.usage?.input_tokens ?? 0,
        output_tokens: data.usage?.output_tokens ?? 0,
      },
    };
  } catch (err) {
    return {
      error: `Network error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Ask Claude to generate an optimal translation system prompt
 * for the given target language.
 */
export interface GeneratedPrompt {
  autonym: string;
  prompt: string;
  usage: ClaudeUsage;
}

/**
 * Ask Claude to generate an optimal translation system prompt
 * for the given target language.  Returns the language's autonym
 * (first line) and a system prompt written in that language (rest).
 */
export async function generateSystemPrompt(
  language: string,
  apiKey: string,
  model: string,
  fetchFn: typeof fetch = fetch
): Promise<GeneratedPrompt | ClaudeErrorResponse> {
  if (!apiKey) {
    return { error: "No API key configured" };
  }

  try {
    const response = await fetchFn("https://api.anthropic.com/v1/messages", {
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
        system: PROMPT_GENERATION_PROMPT,
        messages: [{ role: "user", content: language }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { error: `API error ${response.status}: ${errorBody}` };
    }

    const data = await response.json();
    const raw =
      data.content?.[0]?.type === "text" ? data.content[0].text : "";

    if (!raw.trim()) {
      return { error: "Empty response from model" };
    }

    // First line = autonym, rest (after blank line) = prompt in that language
    const lines = raw.split("\n");
    const autonym = lines[0].trim();
    const prompt = lines.slice(1).join("\n").trim();

    if (!autonym || !prompt) {
      return { error: "Could not parse autonym and prompt from response" };
    }

    return {
      autonym,
      prompt,
      usage: {
        input_tokens: data.usage?.input_tokens ?? 0,
        output_tokens: data.usage?.output_tokens ?? 0,
      },
    };
  } catch (err) {
    return {
      error: `Network error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
