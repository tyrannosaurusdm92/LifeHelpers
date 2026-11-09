# Pass 7 backend-only diagnosis

Verified email-code generation can fail **after** OTP succeeds. Unlike the
OTP route, the chat route calls `onyxTesterChatResponse_()`, which first checks
`aiBrainV1Configured_()` and then calls the registered AI Brain client.
The frontend now waits up to 180 seconds for each chat model response and
reports a specific backend error rather than calling it an OTP failure.
Do not copy credentials into the browser or create a second Apps Script project.
If the deployed backend says the shared AI Brain is unconfigured, only its
existing Script Properties/AI Brain client configuration can resolve that.
The owner-supplied source is not a proof of what version is deployed.

# Pass 3 update: startup and Gemini are separate

Local drafting is fixed and does not require credentials. Actual Gemini invocation **still depends** on the existing deployed backend accepting `onyx.chat` with the authenticated session and returning an Onyx reply in a readable JSON field. Do not consider mock test responses proof of a working live model.

For troubleshooting, use `npm start`, open `http://127.0.0.1:8765/`, select the Gemini provider and check the page status. If it reports unauthorized, confirm the real signed-in session and backend profile. If it reports unexpected response fields, compare the deployed server's action/response schema to `script/onyx widget/backend-client.js` before changing the client. Do not put Gemini API keys, Google tokens or sessions in exported files or URL query strings. Double-click/file mode remains local-only for security and browser compatibility.

---

# Existing OurSpace Gemini routing checklist

**Configured destination in this bundle:** https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec

The workshop sends a POST body with `action=onyx.chat`, namespace `ourspace.onyx`, profileKey, sessionToken, message, mood, and a generator context. The included localhost-only Node relay forwards only this one allowed action to the existing URL, using Google Apps Script's text/plain JSON response and following redirects. The backend must itself validate the session, the profile and the action; a frontend-supplied profileKey is never proof of authentication.

To verify a live Gemini response, an authorized user must test with an existing signed-in OurSpace session in the workshop and inspect backend logs/metadata. A mocked response or a successful HTTP request alone does not establish a Gemini model call. The code checks optional `aiBrain===true` metadata if the backend supplies it; it does not synthesize this flag.

The backend might be using Google's modern Interactions API or the supported generateContent endpoint; this workshop does not assume which Gemini API, model or key is configured server-side. The script URL could fail or be redeployed. This package neither deploys Apps Script nor modifies the AI Brain, and cannot authenticate a nonexistent session by itself.

Avoid CORS bypass via `no-cors` (opaque response) or JSONP (token leakage). For GitHub Pages, place a trusted server-side proxy on the authorized OurSpace origin and point the host integration at it; don't write browser-side API keys. In production use real authentication, origin checking, rate limits, quotas and audit logs.

Official references:
- https://developers.google.com/apps-script/guides/content
- https://developers.google.com/apps-script/guides/web
- https://ai.google.dev/gemini-api/docs/interactions-overview
- https://ai.google.dev/api/generate-content


## Pass 6: Existing tester email access (without a local server)

Use the **Email tester code** button. A correct six-digit verification response returns a temporary tester token. The generator calls `onyx.tester.select` before `onyx.chat` so the backend applies the intended William/Jasper scope. The backend invokes `aiBrainV1Text_` when the tester is configured; the frontend does not have Gemini API keys or identify the model unless the backend explicitly attests to one. A real AI model response has not been verified in this development environment.

The supplied source code's `onyxTesterRequest_` sends only to a server-controlled mailbox, allows at most 8 requests per day with a 180-second cooldown, and its six-digit code expires after 10 minutes, with a maximum of 5 incorrect attempts. Successful access grants 3 hours of read-only testing. Use `onyx.tester.exit` to revoke the temporary token. A previously deployed version may differ.

Technical compromise: `file://` cannot reliably consume Google Apps Script ContentService POST redirects due to CORS. The same supplied backend's GET `callback` response enables JSONP, with the **temporary read-only tester token in the URL**. Do not copy that approach to account sessions or privileged operations. Code verification and tester chat metadata may appear in server or browser network logs.
