import { storage } from "wxt/storage";
import { DEFAULT_MODEL } from "./constants";

/** Claude API key */
export const apiKey = storage.defineItem<string>("local:apiKey", {
  fallback: "",
});

/** Selected Claude model */
export const selectedModel = storage.defineItem<string>("local:selectedModel", {
  fallback: DEFAULT_MODEL,
});

/** Whether the extension is enabled */
export const enabled = storage.defineItem<boolean>("local:enabled", {
  fallback: true,
});

/** Cumulative input tokens used */
export const tokensIn = storage.defineItem<number>("local:tokensIn", {
  fallback: 0,
});

/** Cumulative output tokens used */
export const tokensOut = storage.defineItem<number>("local:tokensOut", {
  fallback: 0,
});

/** Target language for translation, stored as autonym (default: toki pona) */
export const targetLanguage = storage.defineItem<string>(
  "local:targetLanguage",
  { fallback: "toki pona" }
);

/** Claude-generated system prompt for the current target language (empty = use built-in Toki Pona prompt) */
export const customSystemPrompt = storage.defineItem<string>(
  "local:customSystemPrompt",
  { fallback: "" }
);
