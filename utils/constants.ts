import type { ProviderId } from "./providers";

/** Selector for tweet text elements on X/Twitter */
export const TWEET_TEXT_SELECTOR = '[data-testid="tweetText"]';

/** Selector for post text elements on Bluesky (feed + thread views) */
export const BSKY_POST_TEXT_SELECTOR =
  '[data-testid="postText"], [data-testid^="postThreadItem"] [data-word-wrap="1"]';

/** Selector for status text elements on Mastodon */
export const MASTODON_STATUS_TEXT_SELECTOR = ".status__content__text";

/** Selector for comment and title text elements on Hacker News */
export const HN_COMMENT_TEXT_SELECTOR = ".commtext, .titleline > a";

/** Attribute set on processed tweets to avoid re-translation */
export const PROCESSED_ATTR = "data-toki-eki-processed";

/** Debounce interval (ms) for MutationObserver callback */
export const OBSERVER_DEBOUNCE_MS = 300;

/** Timeout (ms) waiting for "Show more" expansion to complete */
export const SHOW_MORE_TIMEOUT_MS = 3_000;

/** Max concurrent API requests from background script */
export const MAX_CONCURRENT_REQUESTS = 3;

/** Provider definition */
export interface ProviderDef {
  id: ProviderId;
  label: string;
  keyPlaceholder: string;
  needsKey: boolean;
  models: ReadonlyArray<{ id: string; label: string }>;
}

/** All supported providers */
export const PROVIDERS: ReadonlyArray<ProviderDef> = [
  {
    id: "claude",
    label: "Claude (Anthropic)",
    keyPlaceholder: "sk-ant-...",
    needsKey: true,
    models: [
      { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5 — fastest, cheapest" },
      { id: "claude-sonnet-4-5-20250929", label: "Sonnet 4.5 — balanced" },
      { id: "claude-opus-4-6", label: "Opus 4.6 — most capable" },
      { id: "claude-sonnet-4-20250514", label: "Sonnet 4" },
      { id: "claude-opus-4-5-20251101", label: "Opus 4.5" },
      { id: "claude-3-haiku-20240307", label: "Haiku 3 — legacy, cheapest" },
    ],
  },
  {
    id: "openai",
    label: "ChatGPT (OpenAI)",
    keyPlaceholder: "sk-...",
    needsKey: true,
    models: [
      { id: "gpt-4o-mini", label: "GPT-4o Mini — fastest, cheapest" },
      { id: "gpt-4o", label: "GPT-4o — balanced" },
      { id: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
      { id: "gpt-4.1", label: "GPT-4.1" },
      { id: "gpt-4-turbo", label: "GPT-4 Turbo — legacy" },
    ],
  },
  {
    id: "gemini",
    label: "Gemini (Google)",
    keyPlaceholder: "AIza...",
    needsKey: true,
    models: [
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash — fastest" },
      { id: "gemini-2.0-pro", label: "Gemini 2.0 Pro" },
      { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
      { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    ],
  },
  {
    id: "ollama",
    label: "Ollama (local)",
    keyPlaceholder: "http://localhost:11434",
    needsKey: false,
    models: [
      { id: "llama3.2", label: "Llama 3.2" },
      { id: "llama3.1", label: "Llama 3.1" },
      { id: "mistral", label: "Mistral" },
      { id: "gemma2", label: "Gemma 2" },
      { id: "phi3", label: "Phi-3" },
      { id: "qwen2.5", label: "Qwen 2.5" },
    ],
  },
];

/** Default provider */
export const DEFAULT_PROVIDER: ProviderId = "claude";

/** Default model per provider */
export const DEFAULT_MODELS: Record<ProviderId, string> = {
  claude: "claude-haiku-4-5-20251001",
  openai: "gpt-4o-mini",
  gemini: "gemini-2.0-flash",
  ollama: "llama3.2",
};

/** System prompt for Toki Pona translation */
export const TRANSLATION_PROMPT = `You are a Toki Pona translator. Translate the given text into Toki Pona.
Rules:
- Output ONLY the Toki Pona translation, nothing else
- Do not add explanations, notes, or commentary
- Preserve line breaks from the original
- For proper nouns, use Toki Pona phonotactics (e.g. "Elon" → "Elon", "Twitter" → "Tuwita")
- For emoji, keep them as-is in the translation`;

/** Meta-prompt used to generate a translation system prompt for a given language */
export const PROMPT_GENERATION_PROMPT = `You are a prompt engineer. The user will name a language. Reply in exactly this format — no other text, no wrapping, no quotes:

Line 1: the language's autonym (the name native speakers use, e.g. Français, Español, toki pona, 日本語)
Line 2: blank
Lines 3+: a concise system prompt, WRITTEN ENTIRELY IN THAT LANGUAGE, that instructs an AI to translate social media posts into it.

The system prompt you generate must instruct the translator to:
1. Output ONLY the translation, nothing else
2. Not add explanations, notes, or commentary
3. Preserve line breaks from the original
4. Handle proper nouns appropriately for the target language
5. Keep emoji as-is in the translation`;

/** Fallback styles for the notice div when no X "Translated from" div is found */
export const FALLBACK_NOTICE_STYLES = {
  container: {
    color: "rgb(113, 118, 123)",
    fontFamily:
      'TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: "13px",
    lineHeight: "16px",
    fontWeight: "400",
    textAlign: "left" as const,
    paddingTop: "4px",
    minHeight: "24px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    wordWrap: "break-word" as const,
    marginTop: "0px",
    minWidth: "0px",
  },
  button: {
    background: "none",
    border: "none",
    color: "rgb(29, 155, 240)",
    cursor: "pointer",
    padding: "0",
    fontSize: "13px",
    fontFamily: "inherit",
    fontWeight: "400",
    lineHeight: "16px",
  },
} as const;

