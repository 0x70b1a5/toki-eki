import { sendMessage } from "../utils/messaging";
import { enabled, targetLanguage } from "../utils/storage";
import { markProcessed } from "../utils/detect";
import {
  expandToot,
  extractTootText,
  findUnprocessedToots,
  observeToots,
} from "../utils/toot-detector";
import {
  buildNoticeDiv,
  insertNotice,
  findExistingNotice,
} from "../utils/notice-dom";

export default defineContentScript({
  // Popular Mastodon instances — add more as needed.
  matches: [
    "*://*.mastodon.social/*",
    "*://*.mastodon.online/*",
    "*://*.mstdn.social/*",
    "*://*.mas.to/*",
    "*://*.mastodon.world/*",
    "*://*.techhub.social/*",
    "*://*.infosec.exchange/*",
    "*://*.hachyderm.io/*",
    "*://*.fosstodon.org/*",
    "*://*.universeodon.com/*",
  ],
  runAt: "document_idle",

  main() {
    let referenceNotice: Element | null = null;
    let lang = "toki pona";
    targetLanguage.getValue().then((v) => (lang = v));
    targetLanguage.watch((v) => (lang = v));

    async function processToot(tootEl: Element) {
      markProcessed(tootEl);

      await expandToot(tootEl);

      const text = extractTootText(tootEl);
      if (!text.trim()) return;

      const originalHTML = tootEl.innerHTML;

      const result = await sendMessage("translateToTokiPona", { text });

      if ("error" in result) {
        console.warn("[toki eki] Translation failed:", result.error);
        return;
      }

      const translation = result.translation;
      tootEl.textContent = translation;

      let showingOriginal = false;

      if (!referenceNotice) {
        referenceNotice = findExistingNotice();
      }

      const currentLang = lang;
      const notice = buildNoticeDiv(
        () => {
          showingOriginal = !showingOriginal;
          if (showingOriginal) {
            tootEl.innerHTML = originalHTML;
            toggleButton.textContent = `Show ${currentLang}`;
            toggleButton.setAttribute("aria-label", `Show ${currentLang}`);
          } else {
            tootEl.textContent = translation;
            toggleButton.textContent = "Show original";
            toggleButton.setAttribute("aria-label", "Show original");
          }
        },
        referenceNotice,
        currentLang
      );

      const toggleButton = notice.querySelector(
        "[data-toki-eki-toggle]"
      ) as HTMLButtonElement;

      insertNotice(notice, tootEl);
    }

    function handleNewToots(toots: Element[]) {
      for (const toot of toots) {
        processToot(toot);
      }
    }

    async function start() {
      const isEnabled = await enabled.getValue();
      if (!isEnabled) return;

      const initial = findUnprocessedToots();
      if (initial.length > 0) {
        handleNewToots(initial);
      }

      observeToots(async (toots) => {
        const isEnabled = await enabled.getValue();
        if (!isEnabled) return;
        handleNewToots(toots);
      });
    }

    start();

    enabled.watch((isEnabled) => {
      if (isEnabled) {
        const toots = findUnprocessedToots();
        if (toots.length > 0) {
          handleNewToots(toots);
        }
      }
    });
  },
});
