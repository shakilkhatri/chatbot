# CLAUDE.md

Frontend-only React chatbot that talks to **OpenRouter API** (OpenAI-compatible) from the browser. Keep this file **concise and updated** as the codebase evolves. Agents: after meaningful changes, update the relevant sections below.

## Tech stack
- React 18 + Create React App (react-scripts)
- Plain JavaScript (JSX) — no TypeScript
- CSS variables for theming (light/dark via `body.dark-mode`)
- `marked` + `DOMPurify` for markdown rendering, `highlight.js` for code, `KaTeX` for math

## Key files
| File | Role |
|---|---|
| `src/Chatbot.jsx` | Main component: messages, streaming, API calls, formatting, settings |
| `src/App.js` | Root — reads `localStorage.aik` (API key), conditionally renders `Chatbot` |
| `src/APIKeyInputPage.jsx` | API key entry, saves to `localStorage.aik` |
| `src/modelData.js` | `useModels()` hook — fetches model pricing from OpenRouter, caches 24h |
| `src/defaultModels.json` | Seed cache for model pricing on first visit |
| `src/utils.js` | `calculateCost()` — token cost in INR paise |
| `src/styles.css` | All styles, dark mode overrides, markdown element CSS |
| `src/CustomModal.jsx` | Modal for custom system instructions |

## Architecture
- **No backend** — API calls go directly from browser to `https://openrouter.ai/api/v1` via the `openai` npm SDK
- **API key** in `localStorage.aik`, passed as `props.apikey` from `App` → `Chatbot`
- **Messages** stored as `[{ text, isUser, images? }]` in `Chatbot` state
- **Streaming** via `client.chat.completions.create({ stream: true })` — chunks accumulated into `streamingMessage`, full text rendered on each chunk
- **System message** is prepended (unless model contains `"o1"`), carries `customInstruction`

## Markdown rendering
- `renderMarkdown(text)` — KaTeX pre-processing for `\[...\]`, then `marked.parse()` → `DOMPurify.sanitize()`. Used for finalized bot messages.
- `renderStreamingMarkdown(text)` — splits on last `\n`, parses stable prefix through `marked`, escapes tail as plain text. Used during streaming.
- Bot messages render into `<div class="message-content">` (not `<pre>`) so `marked`'s `<pre><code>` nests correctly.
- DOMPurify prevents XSS from `dangerouslySetInnerHTML`.

## Commands
- `npm start` — dev server on PORT 3001
- `npm run build` — production build
- `npm test` — CRA test runner with jsdom

## Pitfalls
- No Node/server APIs — browser globals only (`window`, `document`, `navigator`)
- Don't introduce backend code or server-side packages
- CSS specificity matters: `.messages .user-message` / `.messages .bot-message` patterns must be matched when adding selectors
- Model names are full OpenRouter paths (e.g., `openai/gpt-4o-mini`); UI shows only the part after `/`
- The `openai` SDK client is configured with `dangerouslyAllowBrowser: true` — intentional for this architecture
