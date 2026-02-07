import { sendMessage } from "../utils/messaging";
import { enabled, targetLanguage } from "../utils/storage";
import { markProcessed, waitUntilNearViewport } from "../utils/detect";
import {
  expandComment,
  extractCommentText,
  findUnprocessedComments,
  observeComments,
} from "../utils/hn-detector";

/** HN-native notice styles */
const HN_NOTICE_STYLES = "display: inline-flex; gap: 4px; margin-left: 4px; margin-right: 4px;";
const HN_COMMENT_NOTICE_STYLES = "display: inline-flex; gap: 4px; margin-right: 4px;";

/**
 * Create a styled button for HN notices with hover underline.
 */
function createHNButton(initialText: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = initialText;
  button.setAttribute("aria-label", initialText);
  button.setAttribute("data-toki-eki-toggle", "true");
  button.style.cssText =
    "background: none; border: none; color: #828282; cursor: pointer; font-size: inherit; padding: 0;";
  button.addEventListener("mouseenter", () => {
    button.style.textDecoration = "underline";
  });
  button.addEventListener("mouseleave", () => {
    button.style.textDecoration = "none";
  });
  return button;
}

/**
 * Build an HN-native notice for a title (.titleline > a).
 * Returns a <span> with .comhead.sitebit classes.
 */
function buildTitleNotice(onToggle: () => void): HTMLElement {
  const container = document.createElement("span");
  container.className = "comhead sitebit";
  container.style.cssText = HN_NOTICE_STYLES;
  container.setAttribute("data-toki-eki-notice", "true");

  const button = createHNButton("show original");
  button.addEventListener("click", onToggle);
  container.appendChild(button);

  return container;
}

/**
 * Build an HN-native notice for a comment (.commtext).
 * Returns a <span> to be inserted into span.navs with a pipe separator.
 */
function buildCommentNotice(onToggle: () => void): HTMLElement {
  const container = document.createElement("span");
  container.setAttribute("data-toki-eki-notice", "true");
  container.style.cssText = HN_COMMENT_NOTICE_STYLES;

  const button = createHNButton("show original");
  button.addEventListener("click", onToggle);
  container.appendChild(button);

  return container;
}

/**
 * Insert notice for a title - after the title link within .titleline
 */
function insertTitleNotice(notice: HTMLElement, titleEl: Element): void {
  titleEl.after(notice);
}

/**
 * Insert notice for a comment - into span.navs before a.togg.clicky
 */
function insertCommentNotice(notice: HTMLElement, commentEl: Element): void {
  const tdDefault = commentEl.closest("td.default");
  if (tdDefault) {
    const navs = tdDefault.querySelector("span.navs");
    const togg = navs?.querySelector("a.togg.clicky");
    if (navs && togg) {
      const separator = document.createTextNode(" | ");
      navs.insertBefore(separator, togg);
      navs.insertBefore(notice, togg);
      return;
    }
  }
  // Fallback: insert before the comment
  commentEl.parentElement?.insertBefore(notice, commentEl);
}

export default defineContentScript({
  matches: ["*://news.ycombinator.com/*"],
  runAt: "document_idle",

  main() {
    let lang = "toki pona";
    targetLanguage.getValue().then((v) => (lang = v));
    targetLanguage.watch((v) => (lang = v));

    async function processElement(el: Element) {
      markProcessed(el);

      // Wait until near viewport to avoid translating offscreen posts first
      await waitUntilNearViewport(el);

      await expandComment(el);

      const text = extractCommentText(el);
      if (!text.trim()) return;

      const originalHTML = el.innerHTML;

      const result = await sendMessage("translateToTokiPona", { text });

      if ("error" in result) {
        console.warn("[toki eki] Translation failed:", result.error);
        return;
      }

      const translation = result.translation;
      el.textContent = translation;

      let showingOriginal = false;
      const currentLang = lang;

      // Determine if this is a title or comment
      const isTitle = el.matches(".titleline > a");

      const notice = isTitle
        ? buildTitleNotice(() => {
            showingOriginal = !showingOriginal;
            if (showingOriginal) {
              el.innerHTML = originalHTML;
              toggleButton.textContent = `show ${currentLang}`;
              toggleButton.setAttribute("aria-label", `show ${currentLang}`);
            } else {
              el.textContent = translation;
              toggleButton.textContent = "show original";
              toggleButton.setAttribute("aria-label", "show original");
            }
          })
        : buildCommentNotice(() => {
            showingOriginal = !showingOriginal;
            if (showingOriginal) {
              el.innerHTML = originalHTML;
              toggleButton.textContent = `show ${currentLang}`;
              toggleButton.setAttribute("aria-label", `show ${currentLang}`);
            } else {
              el.textContent = translation;
              toggleButton.textContent = "show original";
              toggleButton.setAttribute("aria-label", "show original");
            }
          });

      const toggleButton = notice.querySelector(
        "[data-toki-eki-toggle]"
      ) as HTMLButtonElement;

      if (isTitle) {
        insertTitleNotice(notice, el);
      } else {
        insertCommentNotice(notice, el);
      }
    }

    function handleNewElements(elements: Element[]) {
      for (const el of elements) {
        processElement(el);
      }
    }

    async function start() {
      const isEnabled = await enabled.getValue();
      if (!isEnabled) return;

      const initial = findUnprocessedComments();
      if (initial.length > 0) {
        handleNewElements(initial);
      }

      observeComments(async (elements) => {
        const isEnabled = await enabled.getValue();
        if (!isEnabled) return;
        handleNewElements(elements);
      });
    }

    start();

    enabled.watch((isEnabled) => {
      if (isEnabled) {
        const elements = findUnprocessedComments();
        if (elements.length > 0) {
          handleNewElements(elements);
        }
      }
    });
  },
});
