import { FALLBACK_NOTICE_STYLES, TRANSLATE_SVG } from "./constants";

/**
 * Try to find an existing X "Translated from" notice on the page
 * and clone its container styles/classes. Returns null if not found.
 */
export function findExistingNotice(): Element | null {
  // X's notice contains "Translated from" text and sits before tweetText
  const candidates = document.querySelectorAll('[data-testid="tweetText"]');
  for (const tweet of candidates) {
    const prev = tweet.previousElementSibling;
    if (prev && prev.textContent?.includes("Translated from")) {
      return prev;
    }
  }
  return null;
}

/**
 * Build the notice div for a translated tweet.
 * If a reference notice exists on the page, clone its outer element
 * to inherit X's classes/styles. Otherwise, use fallback styles.
 */
export function buildNoticeDiv(
  onToggle: () => void,
  referenceNotice?: Element | null,
  targetLanguage: string = "toki pona"
): HTMLElement {
  const container = document.createElement("div");
  container.setAttribute("dir", "ltr");
  container.setAttribute("data-toki-eki-notice", "true");

  if (referenceNotice) {
    // Clone classes and inline styles from the reference
    container.className = referenceNotice.className;
    const refStyle = (referenceNotice as HTMLElement).style;
    if (refStyle?.cssText) {
      container.style.cssText = refStyle.cssText;
    }
  } else {
    // Apply fallback styles
    Object.assign(container.style, FALLBACK_NOTICE_STYLES.container);
  }

  // SVG icon
  const iconSpan = document.createElement("span");
  iconSpan.innerHTML = TRANSLATE_SVG;
  container.appendChild(iconSpan);

  // Label
  const label = document.createElement("span");
  label.textContent = `Translated to ${targetLanguage}`;
  container.appendChild(label);

  // Toggle button
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Show original";
  button.setAttribute("aria-label", "Show original");
  button.setAttribute("data-toki-eki-toggle", "true");

  if (referenceNotice) {
    // Try to find the button in the reference and clone its styles
    const refButton = referenceNotice.querySelector("button");
    if (refButton) {
      button.className = refButton.className;
      if (refButton.style?.cssText) {
        button.style.cssText = refButton.style.cssText;
      }
      // Also clone the button's text color
      const refSpan = refButton.querySelector("span");
      if (refSpan) {
        const spanColor = (refSpan as HTMLElement).style?.color;
        if (spanColor) {
          button.style.color = spanColor;
        } else {
          // twitter blue
          button.style.color = "rgb(29, 155, 240)";
        }
      }
    }
  } else {
    Object.assign(button.style, FALLBACK_NOTICE_STYLES.button);
  }

  button.addEventListener("click", onToggle);
  container.appendChild(button);

  return container;
}

/**
 * Insert the notice div as a sibling before the tweet text element.
 * If an existing X notice is present, insert after it instead.
 */
export function insertNotice(
  notice: HTMLElement,
  tweetTextEl: Element
): void {
  const parent = tweetTextEl.parentElement;
  if (!parent) return;

  // Check if there's an existing X "Translated from" notice sibling
  const prev = tweetTextEl.previousElementSibling;
  if (prev && prev.textContent?.includes("Translated from")) {
    prev.after(notice);
  } else {
    parent.insertBefore(notice, tweetTextEl);
  }
}
