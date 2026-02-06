# ![toki eki icon](https://github.com/0x70b1a5/toki-eki/blob/master/public/icon-48.png?raw=true) toki eki

Translate posts on X, Bluesky, and Mastodon to any language using Claude, ChatGPT, Gemini, or Ollama.

![bluesky example](https://github.com/0x70b1a5/toki-eki/blob/master/bsky.png?raw=true)

By [Tobias Merkle](https://nuga.theologi.ca).

## Installation

1. Download the latest release from the [Releases page](https://github.com/0x70b1a5/toki-eki/releases).
2. Unzip the folder.
3. Go to "Manage Extensions" (chrome://extensions).
4. Enable Developer Mode.
5. Click "Load unpacked" and select the extension folder.
6. Set your API key and/or configure Ollama.

## Build

```bash
git clone https://github.com/0x70b1a5/toki-eki
cd toki-eki
npm i
npm run build
```

Then load the unpacked extension in Chrome, set your API key, and you're off to the races.
