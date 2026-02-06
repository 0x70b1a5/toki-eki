import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "toki eki",
    description: "Translate posts on X, Bluesky, and Mastodon to any language using Claude",
    permissions: ["storage"],
    host_permissions: ["https://api.anthropic.com/*"],
  },
  vite: () => ({
    base: "/",
  }),
});
