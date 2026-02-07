# ![toki eki icon](https://github.com/0x70b1a5/toki-eki/blob/master/public/icon-48.png?raw=true) toki eki

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)

Translate posts on X, Bluesky, Mastodon, and Hacker News to any language using Claude, ChatGPT, Gemini, or Ollama.

| Bluesky | Hacker News |
|:-------:|:-----------:|
| ![bluesky example](https://github.com/0x70b1a5/toki-eki/blob/master/bsky.png?raw=true) | ![hn example](https://github.com/0x70b1a5/toki-eki/blob/master/hn.png?raw=true) |

**Supports:** ![Claude](https://img.shields.io/badge/Claude-Anthropic-D97757) ![ChatGPT](https://img.shields.io/badge/ChatGPT-OpenAI-74AA9C) ![Gemini](https://img.shields.io/badge/Gemini-Google-4285F4) ![Ollama](https://img.shields.io/badge/Ollama-Local-7C3AED)

By [Tobias Merkle](https://nuga.theologi.ca).

## Why?

I wanted a way to make my social media time productive for language practice. Instead of doom-scrolling, every post becomes an opportunity to read in your target language.

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

## License

MIT
