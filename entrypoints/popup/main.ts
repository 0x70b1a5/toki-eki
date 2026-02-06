import {
  apiKey,
  enabled,
  selectedModel,
  targetLanguage,
  tokensIn,
  tokensOut,
} from "../../utils/storage";
import { sendMessage } from "../../utils/messaging";
import { CLAUDE_MODELS } from "../../utils/constants";

const apiKeyInput = document.getElementById("apiKeyInput") as HTMLInputElement;
const saveKeyBtn = document.getElementById("saveKeyBtn") as HTMLButtonElement;
const keyStatus = document.getElementById("keyStatus") as HTMLDivElement;
const modelSelect = document.getElementById(
  "modelSelect"
) as HTMLSelectElement;
const enabledToggle = document.getElementById(
  "enabledToggle"
) as HTMLInputElement;
const tokensInEl = document.getElementById("tokensIn") as HTMLDivElement;
const tokensOutEl = document.getElementById("tokensOut") as HTMLDivElement;
const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;

// Advanced
const targetLangInput = document.getElementById(
  "targetLangInput"
) as HTMLInputElement;
const applyLangBtn = document.getElementById(
  "applyLangBtn"
) as HTMLButtonElement;
const langStatus = document.getElementById("langStatus") as HTMLDivElement;

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function setLangStatus(lang: string) {
  const isDefault = lang.toLowerCase() === "toki pona";
  langStatus.textContent = `Using: ${lang}`;
  langStatus.className = "lang-status" + (isDefault ? "" : " is-custom");
}

// Populate model dropdown
for (const model of CLAUDE_MODELS) {
  const opt = document.createElement("option");
  opt.value = model.id;
  opt.textContent = model.label;
  modelSelect.appendChild(opt);
}

// Load initial state
async function init() {
  const key = await apiKey.getValue();
  if (key) {
    apiKeyInput.placeholder = "••••••••••••";
    keyStatus.textContent = "Key saved";
    keyStatus.classList.add("has-key");
  }

  modelSelect.value = await selectedModel.getValue();
  enabledToggle.checked = await enabled.getValue();
  tokensInEl.textContent = formatNumber(await tokensIn.getValue());
  tokensOutEl.textContent = formatNumber(await tokensOut.getValue());

  // Target language
  const lang = await targetLanguage.getValue();
  if (lang.toLowerCase() !== "toki pona") {
    targetLangInput.value = lang;
  }
  setLangStatus(lang);
}

// Save API key
saveKeyBtn.addEventListener("click", async () => {
  const key = apiKeyInput.value.trim();
  if (!key) return;

  await apiKey.setValue(key);
  apiKeyInput.value = "";
  apiKeyInput.placeholder = "••••••••••••";
  keyStatus.textContent = "Key saved";
  keyStatus.classList.add("has-key");

  saveKeyBtn.textContent = "Saved";
  saveKeyBtn.classList.add("saved");
  setTimeout(() => {
    saveKeyBtn.textContent = "Save";
    saveKeyBtn.classList.remove("saved");
  }, 1500);
});

// Model selection
modelSelect.addEventListener("change", async () => {
  await selectedModel.setValue(modelSelect.value);
});

// Toggle enabled state
enabledToggle.addEventListener("change", async () => {
  await enabled.setValue(enabledToggle.checked);
});

// Reset token counters
resetBtn.addEventListener("click", async () => {
  await tokensIn.setValue(0);
  await tokensOut.setValue(0);
  tokensInEl.textContent = "0";
  tokensOutEl.textContent = "0";
});

// Apply target language
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

  // Show the autonym in the input and status
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

// Watch for external changes to token counters
tokensIn.watch((val) => {
  tokensInEl.textContent = formatNumber(val);
});

tokensOut.watch((val) => {
  tokensOutEl.textContent = formatNumber(val);
});

init();
