import { onMessage } from "../utils/messaging";
import {
  selectedProvider,
  customSystemPrompt,
  targetLanguage,
  tokensIn,
  tokensOut,
  ollamaUrl,
  getActiveKey,
  getActiveModel,
  migrateIfNeeded,
} from "../utils/storage";
import {
  translate,
  generatePrompt,
  isApiError,
} from "../utils/providers";
import { MAX_CONCURRENT_REQUESTS, TRANSLATION_PROMPT } from "../utils/constants";

export default defineBackground(() => {
  migrateIfNeeded();

  let activeRequests = 0;
  const queue: Array<{
    text: string;
    resolve: (value: { translation: string } | { error: string }) => void;
  }> = [];

  function processQueue() {
    while (activeRequests < MAX_CONCURRENT_REQUESTS && queue.length > 0) {
      const item = queue.shift()!;
      activeRequests++;

      executeTranslation(item.text)
        .then(item.resolve)
        .finally(() => {
          activeRequests--;
          processQueue();
        });
    }
  }

  async function getSystemPrompt(): Promise<string> {
    const custom = await customSystemPrompt.getValue();
    return custom || TRANSLATION_PROMPT;
  }

  async function executeTranslation(
    text: string
  ): Promise<{ translation: string } | { error: string }> {
    const provider = await selectedProvider.getValue();
    const key = await getActiveKey();
    const model = await getActiveModel();
    const prompt = await getSystemPrompt();
    const ollama = await ollamaUrl.getValue();

    const result = await translate(provider, text, key, model, prompt, ollama);

    if (isApiError(result)) {
      return { error: result.error };
    }

    // Accumulate token usage
    const currentIn = await tokensIn.getValue();
    const currentOut = await tokensOut.getValue();
    await tokensIn.setValue(currentIn + result.usage.input_tokens);
    await tokensOut.setValue(currentOut + result.usage.output_tokens);

    return { translation: result.translation };
  }

  onMessage("translateToTokiPona", ({ data }) => {
    return new Promise((resolve) => {
      queue.push({ text: data.text, resolve });
      processQueue();
    });
  });

  onMessage("generatePrompt", async ({ data }) => {
    const lang = data.language.trim();
    if (!lang) {
      return { error: "No language specified" };
    }

    // Reset to built-in Toki Pona prompt
    if (lang.toLowerCase() === "toki pona") {
      await targetLanguage.setValue("toki pona");
      await customSystemPrompt.setValue("");
      return { autonym: "toki pona" };
    }

    const provider = await selectedProvider.getValue();
    const key = await getActiveKey();
    const model = await getActiveModel();
    const ollama = await ollamaUrl.getValue();

    const result = await generatePrompt(provider, lang, key, model, ollama);

    if (isApiError(result)) {
      return { error: result.error };
    }

    // Store the autonym and generated prompt
    await targetLanguage.setValue(result.autonym);
    await customSystemPrompt.setValue(result.prompt);

    // Count tokens
    const currentIn = await tokensIn.getValue();
    const currentOut = await tokensOut.getValue();
    await tokensIn.setValue(currentIn + result.usage.input_tokens);
    await tokensOut.setValue(currentOut + result.usage.output_tokens);

    return { autonym: result.autonym };
  });
});
