import { sendMessage } from "../utils/messaging";
import { enabled, targetLanguage } from "../utils/storage";
import { markProcessed, waitUntilNearViewport } from "../utils/detect";
import {
  expandPost,
  extractPostText,
  findUnprocessedPosts,
  observePosts,
} from "../utils/post-detector";
import {
  buildNoticeDiv,
  insertNotice,
  findExistingNotice,
} from "../utils/notice-dom";

export default defineContentScript({
  matches: ["*://*.bsky.app/*"],
  runAt: "document_idle",

  main() {
    let referenceNotice: Element | null = null;
    let lang = "toki pona";
    targetLanguage.getValue().then((v) => (lang = v));
    targetLanguage.watch((v) => (lang = v));

    async function processPost(postEl: Element) {
      markProcessed(postEl);

      // Wait until near viewport to avoid translating offscreen posts first
      await waitUntilNearViewport(postEl);

      await expandPost(postEl);

      const text = extractPostText(postEl);
      if (!text.trim()) return;

      const originalHTML = postEl.innerHTML;

      const result = await sendMessage("translateToTokiPona", { text });

      if ("error" in result) {
        console.warn("[toki eki] Translation failed:", result.error);
        return;
      }

      const translation = result.translation;
      postEl.textContent = translation;

      let showingOriginal = false;

      if (!referenceNotice) {
        referenceNotice = findExistingNotice();
      }

      const currentLang = lang;
      const notice = buildNoticeDiv(
        () => {
          showingOriginal = !showingOriginal;
          if (showingOriginal) {
            postEl.innerHTML = originalHTML;
            toggleButton.textContent = `Show ${currentLang}`;
            toggleButton.setAttribute("aria-label", `Show ${currentLang}`);
          } else {
            postEl.textContent = translation;
            toggleButton.textContent = "Show original";
            toggleButton.setAttribute("aria-label", "Show original");
          }
        },
        referenceNotice,
        currentLang,
        postEl
      );

      const toggleButton = notice.querySelector(
        "[data-toki-eki-toggle]"
      ) as HTMLButtonElement;

      insertNotice(notice, postEl);
    }

    function handleNewPosts(posts: Element[]) {
      for (const post of posts) {
        processPost(post);
      }
    }

    async function start() {
      const isEnabled = await enabled.getValue();
      if (!isEnabled) return;

      const initial = findUnprocessedPosts();
      if (initial.length > 0) {
        handleNewPosts(initial);
      }

      observePosts(async (posts) => {
        const isEnabled = await enabled.getValue();
        if (!isEnabled) return;
        handleNewPosts(posts);
      });
    }

    start();

    enabled.watch((isEnabled) => {
      if (isEnabled) {
        const posts = findUnprocessedPosts();
        if (posts.length > 0) {
          handleNewPosts(posts);
        }
      }
    });
  },
});
