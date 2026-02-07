import { HN_COMMENT_TEXT_SELECTOR } from "./constants";
import * as detect from "./detect";

export const extractCommentText = detect.extractText;

/**
 * HN comments don't have "Show more" buttons - all text is visible.
 * This is a no-op for consistency with other detectors.
 */
export const expandComment = (_el: Element) => Promise.resolve();

export const findUnprocessedComments = (root: ParentNode = document) =>
  detect.findUnprocessed(HN_COMMENT_TEXT_SELECTOR, root);

export const observeComments = (
  callback: (comments: Element[]) => void,
  root: Node = document.body
) => detect.observe(HN_COMMENT_TEXT_SELECTOR, callback, root);
