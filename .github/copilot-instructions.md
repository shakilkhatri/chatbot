<!-- Repo-specific guidance for AI coding agents. Keep this concise and action-oriented. -->

# Repository: chatbot — Copilot instructions

This repository is a small React-based chat UI that talks to OpenAI-style chat completions from the browser. The notes below capture the essential patterns and files an agent needs to be productive here.

1. Quick architecture (big picture)

   - Frontend-only React app (Create React App / react-scripts). Entry: `src/index.js` -> `src/App.js`.
   - Main UI: `src/Chatbot.jsx` (message list, input box, settings). API calls to the OpenAI-compatible endpoint are performed directly from the browser using the API key stored in localStorage under `aik` (see `src/APIKeyInputPage.jsx`).
   - Small utilities: `src/utils.js` (cost calculation), `src/constants.js` (model metadata).
   - Small reusable UI: `src/CustomModal.jsx` holds the custom instruction modal used by the chatbot.

2. Important integrations & security notes

   - The app calls https://api.openai.com/v1/chat/completions directly from the client in `Chatbot.jsx` (see `completionsApiCall`). The API key is stored in localStorage (`aik`) by `APIKeyInputPage.jsx`.
   - Because network and API keys are in-browser, changes that affect request/response shape (headers, body, response parsing) must be edited in `Chatbot.jsx` and validated in the browser.
   - There is no backend proxy. Avoid adding secrets into source; keep local API keys out of commits.

3. Developer workflows and commands

   - Start dev server: use npm scripts in `package.json`:
     - start: set PORT=3001 && react-scripts start
     - build: react-scripts build
     - test: react-scripts test --env=jsdom
   - On Windows PowerShell, run: `npm run start` (script already sets PORT in Windows-compatible form).
   - The app was scaffolded with Create React App — use CRA conventions when adding tooling.

4. Project-specific patterns & conventions

   - Local API key handling: The app expects an API key saved to localStorage under key `aik` (see `src/App.js` and `src/APIKeyInputPage.jsx`). When adding features that need the key, read `props.apikey` passed from `App` to `Chatbot`.
   - Message history shape: messages are stored as array items with { text: string, isUser: boolean } (see `Chatbot.jsx`). When building or transforming messages, preserve this shape for render logic.
   - Model metadata: `src/constants.js` exports `models` array used to populate the model select and to compute costs in `utils.js`.
   - UI markup: Chat messages can contain code fences and inline math. `Chatbot.jsx` splits on triple backticks and uses KaTeX for math blocks and `dangerouslySetInnerHTML` for rendering formatted HTML. When modifying formatting, be careful to properly escape or sanitize HTML.
   - Cost calculation: `calculateCost(modelName, usageObject)` expects OpenAI-style `usage` with `prompt_tokens` and `completion_tokens` and uses model cost strings (e.g. "$0.05"). See `src/utils.js` and `src/constants.js`.

5. Tests / lint / build expectations

   - There are no project tests included besides the CRA test script. Running `npm test` uses react-scripts test with jsdom.
   - The project uses plain JavaScript + React (TypeScript is listed in devDependencies but source is JS). Keep edits in JS unless converting intentionally.

6. Typical change points and examples

   - To change how the app sends messages to the API: edit `completionsApiCall` in `src/Chatbot.jsx` (headers, body, response parsing). Example: the request body includes `response_format` and `reasoning_effort` fields.
   - To add a model or change cost rates: update `src/constants.js` (add object with model_name, inputCost, outputCost, isCOT), then `src/utils.js` will pick it up.
   - To change custom instructions behavior: `CustomModal.jsx` controls the modal; `Chatbot.jsx` stores `customInstruction` and injects it as a system message unless the selected model contains "o1".

7. Common pitfalls for agents

   - Avoid introducing server-side only packages or Node backend code — repository is frontend-only and uses browser globals (window, document, navigator).
   - Be careful when modifying rendering that uses `dangerouslySetInnerHTML` — keep math and bold parsing logic in `formatTextWithBoldAndMath` (in `Chatbot.jsx`) consistent.
   - Don't assume a proxy exists for the OpenAI API: requests are made directly to the public endpoint and must include Authorization header with the API key passed via props.

8. Small maintenance suggestions (discoverable & low risk)
   - Validate presence of `props.apikey` in `Chatbot.jsx` before making requests and show a clear UI error.
   - Add a README note describing where to obtain an API key and how to persist it locally (localStorage key `aik`).

If anything above is unclear or you want the instructions to bias toward a particular agent style (e.g., more conservative edits, always add tests, or prefer refactors into hooks/components), say which direction and I will iterate.
