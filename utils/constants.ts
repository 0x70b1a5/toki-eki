/** Selector for tweet text elements on X/Twitter */
export const TWEET_TEXT_SELECTOR = '[data-testid="tweetText"]';

/** Selector for post text elements on Bluesky */
export const BSKY_POST_TEXT_SELECTOR = '[data-testid="postText"]';

/** Selector for status text elements on Mastodon */
export const MASTODON_STATUS_TEXT_SELECTOR = ".status__content__text";

/** Attribute set on processed tweets to avoid re-translation */
export const PROCESSED_ATTR = "data-toki-eki-processed";

/** Debounce interval (ms) for MutationObserver callback */
export const OBSERVER_DEBOUNCE_MS = 300;

/** Timeout (ms) waiting for "Show more" expansion to complete */
export const SHOW_MORE_TIMEOUT_MS = 3_000;

/** Max concurrent Claude API requests from background script */
export const MAX_CONCURRENT_REQUESTS = 3;

/** Available Claude models (id → display label) */
export const CLAUDE_MODELS: ReadonlyArray<{
  id: string;
  label: string;
}> = [
  { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5 — fastest, cheapest" },
  { id: "claude-sonnet-4-5-20250929", label: "Sonnet 4.5 — balanced" },
  { id: "claude-opus-4-6", label: "Opus 4.6 — most capable" },
  { id: "claude-sonnet-4-20250514", label: "Sonnet 4" },
  { id: "claude-opus-4-5-20251101", label: "Opus 4.5" },
  { id: "claude-3-haiku-20240307", label: "Haiku 3 — legacy, cheapest" },
];

/** Default model */
export const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

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

/** SVG icon used in X's native "Translated from" notice (the Grok/translate icon) */
export const TRANSLATE_SVG = `<svg viewBox="0 0 33 32" aria-hidden="true" style="width: 1em; height: 1em; fill: currentColor; vertical-align: middle;"><g><path d="M12.745 20.54l10.97-8.19c.539-.4 1.307-.244 1.564.38 1.349 3.288.746 7.241-1.938 9.955-2.683 2.714-6.417 3.31-9.83 1.954l-3.728 1.745c5.347 3.697 11.84 2.782 15.898-1.324 3.219-3.255 4.216-7.692 3.284-11.693l.008.009c-1.351-5.878.332-8.227 3.782-13.031L33 0l-4.54 4.59v-.014L12.743 20.544m-2.263 1.987c-3.837-3.707-3.175-9.446.1-12.755 2.42-2.449 6.388-3.448 9.852-1.979l3.72-1.737c-.67-.49-1.53-1.017-2.515-1.387-4.455-1.854-9.789-.931-13.41 2.728-3.483 3.523-4.579 8.94-2.697 13.561 1.405 3.454-.899 5.898-3.22 8.364C1.49 30.2.666 31.074 0 32l10.478-9.466"></path></g></svg>`;
