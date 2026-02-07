import { sendMessage } from "../utils/messaging";
import { enabled, targetLanguage } from "../utils/storage";
import { markProcessed, waitUntilNearViewport } from "../utils/detect";
import {
  expandComment,
  extractCommentText,
  findUnprocessedComments,
  observeComments,
} from "../utils/hn-detector";
import {
  buildNoticeDiv,
  insertNotice,
  findExistingNotice,
} from "../utils/notice-dom";

export default defineContentScript({
  matches: ["*://news.ycombinator.com/*"],
  runAt: "document_idle",

  main() {
    let referenceNotice: Element | null = null;
    let lang = "toki pona";
    targetLanguage.getValue().then((v) => (lang = v));
    targetLanguage.watch((v) => (lang = v));

    async function processComment(commentEl: Element) {
      markProcessed(commentEl);

      // Wait until near viewport to avoid translating offscreen posts first
      await waitUntilNearViewport(commentEl);

      await expandComment(commentEl);

      const text = extractCommentText(commentEl);
      if (!text.trim()) return;

      const originalHTML = commentEl.innerHTML;

      const result = await sendMessage("translateToTokiPona", { text });

      if ("error" in result) {
        console.warn("[toki eki] Translation failed:", result.error);
        return;
      }

      const translation = result.translation;
      commentEl.textContent = translation;

      let showingOriginal = false;

      if (!referenceNotice) {
        referenceNotice = findExistingNotice();
      }

      const currentLang = lang;
      const notice = buildNoticeDiv(
        () => {
          showingOriginal = !showingOriginal;
          if (showingOriginal) {
            commentEl.innerHTML = originalHTML;
            toggleButton.textContent = `Show ${currentLang}`;
            toggleButton.setAttribute("aria-label", `Show ${currentLang}`);
          } else {
            commentEl.textContent = translation;
            toggleButton.textContent = "Show original";
            toggleButton.setAttribute("aria-label", "Show original");
          }
        },
        referenceNotice,
        currentLang,
        commentEl
      );

      const toggleButton = notice.querySelector(
        "[data-toki-eki-toggle]"
      ) as HTMLButtonElement;

      insertNotice(notice, commentEl);
    }

    function handleNewComments(comments: Element[]) {
      for (const comment of comments) {
        processComment(comment);
      }
    }

    async function start() {
      const isEnabled = await enabled.getValue();
      if (!isEnabled) return;

      const initial = findUnprocessedComments();
      if (initial.length > 0) {
        handleNewComments(initial);
      }

      observeComments(async (comments) => {
        const isEnabled = await enabled.getValue();
        if (!isEnabled) return;
        handleNewComments(comments);
      });
    }

    start();

    enabled.watch((isEnabled) => {
      if (isEnabled) {
        const comments = findUnprocessedComments();
        if (comments.length > 0) {
          handleNewComments(comments);
        }
      }
    });
  },
});
