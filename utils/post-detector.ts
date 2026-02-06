import { BSKY_POST_TEXT_SELECTOR } from "./constants";
import * as detect from "./detect";

export const extractPostText = detect.extractText;

export const expandPost = (el: Element) =>
  detect.expandShowMore(
    el,
    (e) =>
      e.closest('[data-testid^="feedItem"]') ??
      e.closest('[data-testid^="postThread"]') ??
      e.parentElement
  );

export const findUnprocessedPosts = (root: ParentNode = document) =>
  detect.findUnprocessed(BSKY_POST_TEXT_SELECTOR, root);

export const observePosts = (
  callback: (posts: Element[]) => void,
  root: Node = document.body
) => detect.observe(BSKY_POST_TEXT_SELECTOR, callback, root);
