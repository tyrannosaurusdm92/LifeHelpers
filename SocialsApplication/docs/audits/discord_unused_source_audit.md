# Unused Source Audit

The following code categories were intentionally **not** copied into the end-code folders. They are represented by documentation, license files, and clean-room merged equivalents instead.

| Category | Why it was not copied into runtime | Where the useful idea went |
|---|---|---|
| Full Electron clients | Would add hundreds of files, long paths, build tooling, and a separate desktop app goal. | Audited in `MERGE_AUDIT.md`; no runtime copy. |
| BetterDiscord/OpenAsar client modification code | Would create client-injection/client-replacement behavior instead of a portable plug-in. | Kept as architecture reference only. |
| Full React/Node Accord app | Duplicates the compact messenger API/UI and adds deeper build requirements. | Channel/chat UX distilled into `public/` and `app.js`. |
| PHP Discord library | Useful if you want a PHP bot later, but duplicates the Node interaction backend. | Documented only; final package uses one backend. |
| History tracker desktop/browser source | Direct tracking/scraping code is not needed for the merged app. | Safe user-provided JSON import is implemented in `src/history.js`. |
| Lemonade local AI runtime | Not a Discord runtime component; mostly unrelated to the messenger plug-in goal. | Documented only. |
| Build caches, lockfiles, CI folders, issue templates | Not needed for the end app and add path noise. | Excluded from runtime ZIP. |

This keeps the provided ZIP small, Windows-friendly, and focused on a single usable merged program instead of a pile of overlapping repository mirrors.
