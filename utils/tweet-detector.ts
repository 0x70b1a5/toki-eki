import { TWEET_TEXT_SELECTOR } from "./constants";
import * as detect from "./detect";

export const extractTweetText = detect.extractText;

export const expandTweet = (el: Element) =>
  detect.expandShowMore(el, (e) => e.closest("article"));

export const findUnprocessedTweets = (root: ParentNode = document) =>
  detect.findUnprocessed(TWEET_TEXT_SELECTOR, root);

export const observeTweets = (
  callback: (tweets: Element[]) => void,
  root: Node = document.body
) => detect.observe(TWEET_TEXT_SELECTOR, callback, root);
