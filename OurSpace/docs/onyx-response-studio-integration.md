# Onyx Response Studio — OurSpace integration

## What was integrated
The existing OurSpace/assets/code/onyx_widget.html now contains the Response Studio panel, opened from the Work widget card or Work fullscreen icon. No additional HTML page or iframe is introduced.

- Backend module: OurSpace/script/onyx widget/onyx-responses.js
- UI module: OurSpace/script/onyx widget/onyx-response-studio.js
- Scoped CSS: OurSpace/style/onyx widget/onyx-response-studio.css
- Voice reference: OurSpace/json/onyx widget/response-studio-voice.json

## Brain continuity
Canonical reasoning, retrieval, profile privacy, tools and Gemini routing remain in Onyx/script/js/onyx/onyx-core/index.js, accessed through the existing OurSpace widget repository bridge and OnyxBrainLink. The Onyx/ directory was not modified. The tester path is the proven Pass 7 email-code verification and read-only onyx.chat JSONP contract on the already deployed Apps Script backend.

## Limits and safety
The original Pass 7 10,000-example offline corpus, local rule composer and test harness have not been copied into this public site. The integrated studio instead calls the actual canonical Onyx brain or the read-only backend tester. Generated drafts are not automatically saved to the backend. Approve and save stores a response in the current browser only, separated by profile; Export produces a JS file with those manually approved responses. It does not teach the remote model or modify Onyx/.

JSONP tester requests carry a temporary tester token and text in URLs, which can be logged by intermediaries. Never use this path for private information, account credentials, clinical details or writable actions. Normal account tokens are never used in tester JSONP. Test credentials are memory-only and must be reverified after refresh.

## Pre-merge tests
1. Open widget: ensure all three tabs, the existing game, Professor, and fullscreen Work still function.
2. Open Response Studio from Work bubble and full Work header: close and reopen.
3. Request tester email code, verify six digits, generate one Leisure response to Hey buddy how are you doing?, then try Work.
4. Switch William/Jasper; check Papa/Momma, profile separation of approved replies, and no clinical content stored.
5. Export approved onyx-responses.js and verify it has no backend token.
6. With actual OurSpace login, confirm canonical Onyx repository bridge reports available and the generator produces from the shared AI Brain.
7. Review console/network behavior and visual layout on mobile.

The GitHub integration changes are not a tested production deployment. Keep this pull request unmerged until browser and real Gemini verification succeed.