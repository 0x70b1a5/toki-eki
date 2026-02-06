import { sendMessage } from "../utils/messaging";
import { enabled, targetLanguage } from "../utils/storage";
import { markProcessed } from "../utils/detect";
import {
  expandTweet,
  extractTweetText,
  findUnprocessedTweets,
  observeTweets,
} from "../utils/tweet-detector";
import {
  buildNoticeDiv,
  insertNotice,
  findExistingNotice,
} from "../utils/notice-dom";

export default defineContentScript({
  matches: ["*://*.x.com/*", "*://*.twitter.com/*"],
  runAt: "document_idle",

  main() {
    let referenceNotice: Element | null = null;
    let lang = "toki pona";
    targetLanguage.getValue().then((v) => (lang = v));
    targetLanguage.watch((v) => (lang = v));

    async function processTweet(tweetEl: Element) {
      markProcessed(tweetEl);

      await expandTweet(tweetEl);

      const text = extractTweetText(tweetEl);
      if (!text.trim()) return;

      const originalHTML = tweetEl.innerHTML;

      const result = await sendMessage("translateToTokiPona", { text });

      if ("error" in result) {
        console.warn("[toki eki] Translation failed:", result.error);
        return;
      }

      const translation = result.translation;
      tweetEl.textContent = translation;

      let showingOriginal = false;

      if (!referenceNotice) {
        referenceNotice = findExistingNotice();
      }

      const currentLang = lang;
      const notice = buildNoticeDiv(
        () => {
          showingOriginal = !showingOriginal;
          if (showingOriginal) {
            tweetEl.innerHTML = originalHTML;
            toggleButton.textContent = `Show ${currentLang}`;
            toggleButton.setAttribute("aria-label", `Show ${currentLang}`);
          } else {
            tweetEl.textContent = translation;
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

      insertNotice(notice, tweetEl);
    }

    function handleNewTweets(tweets: Element[]) {
      for (const tweet of tweets) {
        processTweet(tweet);
      }
    }

    async function start() {
      const isEnabled = await enabled.getValue();
      if (!isEnabled) return;

      const initial = findUnprocessedTweets();
      if (initial.length > 0) {
        handleNewTweets(initial);
      }

      observeTweets(async (tweets) => {
        const isEnabled = await enabled.getValue();
        if (!isEnabled) return;
        handleNewTweets(tweets);
      });
    }

    start();

    enabled.watch((isEnabled) => {
      if (isEnabled) {
        const tweets = findUnprocessedTweets();
        if (tweets.length > 0) {
          handleNewTweets(tweets);
        }
      }
    });
  },
});
