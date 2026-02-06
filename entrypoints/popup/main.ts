import {
  selectedProvider,
  providerKeys,
  providerModels,
  ollamaUrl,
  enabled,
  tokensIn,
  tokensOut,
  targetLanguage,
  migrateIfNeeded,
} from "../../utils/storage";
import { sendMessage } from "../../utils/messaging";
import { PROVIDERS, DEFAULT_MODELS } from "../../utils/constants";
import type { ProviderId } from "../../utils/providers";

// ── DOM refs ──

const providerSelect = document.getElementById("providerSelect") as HTMLSelectElement;

const keySection = document.getElementById("keySection") as HTMLDivElement;
const keyLabel = document.getElementById("keyLabel") as HTMLDivElement;
const apiKeyInput = document.getElementById("apiKeyInput") as HTMLInputElement;
const saveKeyBtn = document.getElementById("saveKeyBtn") as HTMLButtonElement;
const keyStatus = document.getElementById("keyStatus") as HTMLDivElement;

const ollamaSection = document.getElementById("ollamaSection") as HTMLDivElement;
const ollamaUrlInput = document.getElementById("ollamaUrlInput") as HTMLInputElement;
const saveUrlBtn = document.getElementById("saveUrlBtn") as HTMLButtonElement;
const urlStatus = document.getElementById("urlStatus") as HTMLDivElement;

const modelSelect = document.getElementById("modelSelect") as HTMLSelectElement;
const enabledToggle = document.getElementById("enabledToggle") as HTMLInputElement;
const tokensInEl = document.getElementById("tokensIn") as HTMLDivElement;
const tokensOutEl = document.getElementById("tokensOut") as HTMLDivElement;
const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;

const targetLangInput = document.getElementById("targetLangInput") as HTMLInputElement;
const applyLangBtn = document.getElementById("applyLangBtn") as HTMLButtonElement;
const langStatus = document.getElementById("langStatus") as HTMLDivElement;

// ── Helpers ──

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function setLangStatus(lang: string) {
  const isDefault = lang.toLowerCase() === "toki pona";
  langStatus.textContent = `Using: ${lang}`;
  langStatus.className = "lang-status" + (isDefault ? "" : " is-custom");
}

function getProviderDef(id: ProviderId) {
  return PROVIDERS.find((p) => p.id === id)!;
}

function flashSaved(btn: HTMLButtonElement, label = "Save") {
  btn.textContent = "Saved";
  btn.classList.add("saved");
  setTimeout(() => {
    btn.textContent = label;
    btn.classList.remove("saved");
  }, 1500);
}

// ── Populate provider dropdown ──

for (const provider of PROVIDERS) {
  const opt = document.createElement("option");
  opt.value = provider.id;
  opt.textContent = provider.label;
  providerSelect.appendChild(opt);
}

// ── Populate / refresh model dropdown for a provider ──

async function refreshModels(providerId: ProviderId) {
  const def = getProviderDef(providerId);
  modelSelect.innerHTML = "";
  for (const m of def.models) {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.label;
    modelSelect.appendChild(opt);
  }

  const models = await providerModels.getValue();
  modelSelect.value = models[providerId] ?? DEFAULT_MODELS[providerId] ?? "";
}

// ── Show/hide key vs URL section based on provider ──

async function refreshKeyUI(providerId: ProviderId) {
  const def = getProviderDef(providerId);

  if (def.needsKey) {
    keySection.classList.remove("hidden");
    ollamaSection.classList.add("hidden");
    keyLabel.textContent = "API Key";
    apiKeyInput.placeholder = def.keyPlaceholder;

    const keys = await providerKeys.getValue();
    if (keys[providerId]) {
      apiKeyInput.value = "";
      apiKeyInput.placeholder = "••••••••••••";
      keyStatus.textContent = "Key saved";
      keyStatus.classList.add("has-key");
    } else {
      apiKeyInput.value = "";
      apiKeyInput.placeholder = def.keyPlaceholder;
      keyStatus.textContent = "";
      keyStatus.classList.remove("has-key");
    }
  } else {
    keySection.classList.add("hidden");
    ollamaSection.classList.remove("hidden");

    const url = await ollamaUrl.getValue();
    ollamaUrlInput.value = url;
    urlStatus.textContent = "";
  }
}

// ── Init ──

async function init() {
  await migrateIfNeeded();

  const provider = await selectedProvider.getValue();
  providerSelect.value = provider;

  await refreshModels(provider);
  await refreshKeyUI(provider);

  enabledToggle.checked = await enabled.getValue();
  tokensInEl.textContent = formatNumber(await tokensIn.getValue());
  tokensOutEl.textContent = formatNumber(await tokensOut.getValue());

  const lang = await targetLanguage.getValue();
  if (lang.toLowerCase() !== "toki pona") {
    targetLangInput.value = lang;
  }
  setLangStatus(lang);
}

// ── Provider change ──

providerSelect.addEventListener("change", async () => {
  const id = providerSelect.value as ProviderId;
  await selectedProvider.setValue(id);
  await refreshModels(id);
  await refreshKeyUI(id);
});

// ── Save API key ──

saveKeyBtn.addEventListener("click", async () => {
  const key = apiKeyInput.value.trim();
  if (!key) return;

  const provider = await selectedProvider.getValue();
  const keys = await providerKeys.getValue();
  await providerKeys.setValue({ ...keys, [provider]: key });

  apiKeyInput.value = "";
  apiKeyInput.placeholder = "••••••••••••";
  keyStatus.textContent = "Key saved";
  keyStatus.classList.add("has-key");
  flashSaved(saveKeyBtn);
});

// ── Save Ollama URL ──

saveUrlBtn.addEventListener("click", async () => {
  const url = ollamaUrlInput.value.trim() || "http://localhost:11434";
  await ollamaUrl.setValue(url);
  ollamaUrlInput.value = url;
  urlStatus.textContent = "URL saved";
  urlStatus.classList.add("has-key");
  flashSaved(saveUrlBtn);
});

// ── Model selection ──

modelSelect.addEventListener("change", async () => {
  const provider = await selectedProvider.getValue();
  const models = await providerModels.getValue();
  await providerModels.setValue({ ...models, [provider]: modelSelect.value });
});

// ── Toggle enabled ──

enabledToggle.addEventListener("change", async () => {
  await enabled.setValue(enabledToggle.checked);
});

// ── Reset tokens ──

resetBtn.addEventListener("click", async () => {
  await tokensIn.setValue(0);
  await tokensOut.setValue(0);
  tokensInEl.textContent = "0";
  tokensOutEl.textContent = "0";
});

// ── Apply target language ──

applyLangBtn.addEventListener("click", async () => {
  const lang = targetLangInput.value.trim() || "Toki Pona";

  applyLangBtn.textContent = "Generating…";
  applyLangBtn.disabled = true;
  langStatus.textContent = "";
  langStatus.className = "lang-status";

  const result = await sendMessage("generatePrompt", { language: lang });

  applyLangBtn.disabled = false;

  if ("error" in result) {
    langStatus.textContent = result.error;
    langStatus.className = "lang-status is-error";
    applyLangBtn.textContent = "Apply";
    return;
  }

  const autonym = result.autonym;
  targetLangInput.value = autonym === "toki pona" ? "" : autonym;
  setLangStatus(autonym);

  applyLangBtn.textContent = "Applied";
  applyLangBtn.classList.add("saved");
  setTimeout(() => {
    applyLangBtn.textContent = "Apply";
    applyLangBtn.classList.remove("saved");
  }, 1500);
});

// ── Watch external changes ──

tokensIn.watch((val) => {
  tokensInEl.textContent = formatNumber(val);
});

tokensOut.watch((val) => {
  tokensOutEl.textContent = formatNumber(val);
});

init();
