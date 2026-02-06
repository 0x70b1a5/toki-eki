import { storage } from "wxt/storage";
import type { ProviderId } from "./providers";
import { DEFAULT_PROVIDER, DEFAULT_MODELS } from "./constants";

/** Selected provider */
export const selectedProvider = storage.defineItem<ProviderId>(
  "local:selectedProvider",
  { fallback: DEFAULT_PROVIDER }
);

/** API keys keyed by provider id */
export const providerKeys = storage.defineItem<Record<string, string>>(
  "local:providerKeys",
  { fallback: {} }
);

/** Selected model keyed by provider id */
export const providerModels = storage.defineItem<Record<string, string>>(
  "local:providerModels",
  { fallback: {} }
);

/** Ollama server URL */
export const ollamaUrl = storage.defineItem<string>("local:ollamaUrl", {
  fallback: "http://localhost:11434",
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

/** Generated system prompt for the current target language (empty = use built-in Toki Pona prompt) */
export const customSystemPrompt = storage.defineItem<string>(
  "local:customSystemPrompt",
  { fallback: "" }
);

// ── Migration: move legacy `apiKey` / `selectedModel` into new per-provider stores ──

const legacyApiKey = storage.defineItem<string>("local:apiKey", {
  fallback: "",
});
const legacyModel = storage.defineItem<string>("local:selectedModel", {
  fallback: "",
});

export async function migrateIfNeeded(): Promise<void> {
  const keys = await providerKeys.getValue();
  if (keys.claude) return; // already migrated

  const oldKey = await legacyApiKey.getValue();
  const oldModel = await legacyModel.getValue();

  if (oldKey) {
    await providerKeys.setValue({ ...keys, claude: oldKey });
    await legacyApiKey.setValue("");
  }
  if (oldModel) {
    const models = await providerModels.getValue();
    await providerModels.setValue({ ...models, claude: oldModel });
    await legacyModel.setValue("");
  }
}

// ── Convenience helpers ──

export async function getActiveKey(): Promise<string> {
  const provider = await selectedProvider.getValue();
  const keys = await providerKeys.getValue();
  return keys[provider] ?? "";
}

export async function getActiveModel(): Promise<string> {
  const provider = await selectedProvider.getValue();
  const models = await providerModels.getValue();
  return models[provider] ?? DEFAULT_MODELS[provider] ?? "";
}
