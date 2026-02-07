import {
  PROCESSED_ATTR,
  OBSERVER_DEBOUNCE_MS,
  SHOW_MORE_TIMEOUT_MS,
} from "./constants";

/**
 * Extract visible text from an element, handling emoji <img alt="..."> tags
 * and nested spans (not just textContent).
 */
export function extractText(el: Element): string {
  const parts: string[] = [];

  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      parts.push(node.textContent ?? "");
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (element.tagName === "IMG" && element.getAttribute("alt")) {
        parts.push(element.getAttribute("alt")!);
      } else {
        for (const child of element.childNodes) {
          walk(child);
        }
      }
    }
  }

  walk(el);
  return parts.join("");
}

/** Mark an element as processed to avoid re-translation */
export function markProcessed(el: Element): void {
  el.setAttribute(PROCESSED_ATTR, "true");
}

/**
 * Returns a promise that resolves when the element is within
 * one viewport height of being visible. This prevents translating
 * offscreen posts before visible ones.
 */
export function waitUntilNearViewport(el: Element): Promise<void> {
  return new Promise((resolve) => {
    // rootMargin extends the viewport by 100% in each direction
    // so we trigger when the element is within one screen height
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect();
          resolve();
        }
      },
      { rootMargin: "100%" }
    );
    observer.observe(el);
  });
}

/** Find all unprocessed elements matching a selector */
export function findUnprocessed(
  selector: string,
  root: ParentNode = document
): Element[] {
  return Array.from(root.querySelectorAll(selector)).filter(
    (el) => !el.hasAttribute(PROCESSED_ATTR)
  );
}

/**
 * If the post contains a "Show more" button, click it and wait
 * for the full text to load before returning.
 */
export async function expandShowMore(
  postEl: Element,
  findContainer: (el: Element) => Element | null
): Promise<void> {
  const container = findContainer(postEl);
  if (!container) return;

  let showMoreBtn: HTMLElement | null = null;
  for (const btn of container.querySelectorAll<HTMLElement>(
    "button, [role='button']"
  )) {
    const span = btn.querySelector("span");
    if (span && span.textContent?.trim() === "Show more") {
      showMoreBtn = btn;
      break;
    }
  }
  if (!showMoreBtn) return;

  showMoreBtn.click();

  // Wait until the button is removed from the DOM (text expanded)
  await new Promise<void>((resolve) => {
    const observer = new MutationObserver(() => {
      if (!container.contains(showMoreBtn)) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    // Fallback timeout so we never hang forever
    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, SHOW_MORE_TIMEOUT_MS);
  });
}

/**
 * Start a debounced MutationObserver that calls `callback` with
 * newly-found unprocessed posts matching the given selector.
 */
export function observe(
  selector: string,
  callback: (posts: Element[]) => void,
  root: Node = document.body
): MutationObserver {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const observer = new MutationObserver(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const posts = findUnprocessed(selector, root as ParentNode);
      if (posts.length > 0) {
        callback(posts);
      }
    }, OBSERVER_DEBOUNCE_MS);
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
  });

  return observer;
}
