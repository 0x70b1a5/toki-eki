import { MASTODON_STATUS_TEXT_SELECTOR } from "./constants";
import * as detect from "./detect";

export const extractTootText = detect.extractText;

/**
 * Mastodon keeps full post text in the DOM even when collapsed
 * (CSS overflow:hidden), so expansion is rarely needed.
 * CW reveals are handled by Mastodon's React; the MutationObserver
 * picks up newly-rendered elements automatically.
 */
export const expandToot = (el: Element) =>
  detect.expandShowMore(
    el,
    (e) => e.closest(".status__wrapper") ?? e.closest(".status")
  );

export const findUnprocessedToots = (root: ParentNode = document) =>
  detect.findUnprocessed(MASTODON_STATUS_TEXT_SELECTOR, root);

export const observeToots = (
  callback: (toots: Element[]) => void,
  root: Node = document.body
) => detect.observe(MASTODON_STATUS_TEXT_SELECTOR, callback, root);
