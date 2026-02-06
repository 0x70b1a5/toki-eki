import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "toki eki",
    description: "Translate posts on X, Bluesky, and Mastodon to any language using AI",
    permissions: ["storage"],
    host_permissions: [
      "https://api.anthropic.com/*",
      "https://api.openai.com/*",
      "https://generativelanguage.googleapis.com/*",
      "http://localhost/*",
      "http://127.0.0.1/*",
    ],
  },
  vite: () => ({
    base: "/",
  }),
});
