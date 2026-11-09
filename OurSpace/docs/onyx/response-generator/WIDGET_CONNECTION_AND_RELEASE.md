# Installing the repaired generator; do not replace Onyx's UI with the workshop

The existing project has **one HTML file**, `assets/code/index.html`. `generator.css` is for the workshop only. `script/onyx widget/onyx-responses.js` is the canonical JavaScript ESM entrypoint for the workshop and any authorized future widget bridge. The live UI widget, Onyx Adventures, and user's deployed Apps Script backend are separate assets and are not modified by this ZIP.

## Test locally

Open `assets/code/index.html` after extracting the ZIP, or open the separately supplied standalone HTML. The bundled corpus and WASM scorer work without external file fetching. Choose **Leisure**, William or Jasper, and use the exact sentence `Hey buddy how are you doing?`. Local generation/chat responds socially. Local output is not Gemini.

## Test Gemini, if an authorized OurSpace session exists

Run `npm start` from the ZIP root with Node 18+ on the user's own machine; open `http://127.0.0.1:8765/`. Under **Live backend connection**, enter a valid currently signed-in OurSpace token (never paste this into a chat or commit it to GitHub), then use **Test authenticated backend conversation**. It performs only a single approved Onyx chat request to the existing Apps Script address via the local relay. A response confirms the deployed action responded; it does NOT by itself verify which LLM the backend used. Clear the token field on exit.

If the request fails, the status shows the failure rather than manufacturing a Gemini reply. `onyx.chat` response schema, authentication and Gemini model selection must be checked against the actual server deployment. Hosting on GitHub Pages alone does not provide a same-origin relay. No new server-side files, Firebase config, Gemini keys or Google Apps Script edits are included.

## Pass 4 interface behavior

The page defaults to the Leisure radio button and the formerly broken greeting. Work remains available on demand. Backend replies that are plainly social-intent mismatches are retried once, then replaced with **labeled local repair** if still off-topic. The UI never labels this repair as a successful Gemini generation. Shared memory across devices and verified service-cat monitoring are not implemented.

## Important distinction

Creating an actual open-ended conversational LLM requires a running trained model (its weight files and tokenizer) or a usable authenticated Gemini endpoint. The eleven uploaded repositories cannot themselves make a static HTML file think like a model. The response composer only handles a narrow set of local cases; the backend, when validated, is the place for spontaneous unbounded conversation.
