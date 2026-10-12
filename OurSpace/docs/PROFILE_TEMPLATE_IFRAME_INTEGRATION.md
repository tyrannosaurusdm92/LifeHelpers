# OurSpace profile iframe integration – 2026-10-10

- OurSpace root `ourspace.html` is the only top-level HTML file, and uses `css/ourspace-core/ourspace.css` for portal/sign-in only.
- `assets/code/william.html` and `assets/code/jasper.html` remain the Onyx widget hosts.
- The preserved `js/ourspace-core/profile-access.js` now builds the profile-content iframe directly from the supplied internal-page template HTML. No duplicate JS bundles were added.
- The iframe loads exactly one user stylesheet (`william.css` / `jasper.css`) and the existing shared JavaScript modules. CSS/JS are in permitted directories.
- `assets/code/skills.html` is loaded from the Skills page in each iframe; its DBT worksheets are linked by its own runtime.
- The Games tab loads https://tyrannosaurusdm92.github.io/LifeHelpers/Games/index.html inside the existing Games iframe. If the destination refuses framing via response headers, the browser enforces that policy, and this integration cannot override it.
- Internal-page routing uses parent hash, e.g. `assets/code/william.html#skills`; profile switch returns to the other user profile path.
- Existing Apps Script endpoint remains unchanged. This package does not contain or modify backend code.
- Non-widget media is loaded from existing GitHub links; retained local atlases, Onyx animation frames, widget border/notification loader, and communication audio are preserved.

**No new scripts are copied from the template.** The template's layout, content, CSS and final Design fixes are integrated into existing files.

*The archive browser smoke test was blocked by local browser policy (`ERR_BLOCKED_BY_ADMINISTRATOR`); code/structure checks below are independently verified.*

*The archive browser smoke test was blocked by local browser policy (`ERR_BLOCKED_BY_ADMINISTRATOR`); code/structure checks below are independently verified.*
