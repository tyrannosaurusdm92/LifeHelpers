# Onyx Widget and Skills reintegration — frontend only

This package preserves the original OurSpace files, imports the **new supplied Onyx-Widget source** and leaves `assets/code/game.html` as the supplied unmodified placeholder. The previous Onyx Widget and CAT-astrophic game were not restored.

## Paths

- `assets/code/onyx_widget.html` — current widget, lazy iframe on signed-in pages
- `assets/code/skills.html` — self-contained 102-pair DBT handbook/worksheet browser
- `assets/code/game.html` — unchanged game placeholder; no game assets recreated
- `script/onyx widget/`, `style/onyx widget/`, `json/onyx widget/`
- `assets/images/onyx widget/`, `assets/audio/onyx widget/`
- `json/william/`, `json/jasper/`, and `json/shared/` — **single, unchanged** canonical JSON data tree

## Navigation

The original sleeping-Onyx button is before Page Navigation in the Jump Nav and now toggles the lazy iframe. The existing Design Widget button remains after Page Navigation. The Design Widget controls *inside* Onyx send a same-origin message to the containing page to open/hide the existing OurSpace Design Studio; a second Design Studio is not created.

## Skills and homework

The Skills link in both users' Master Nav opens the embedded `skills.html` page. All 102 DBT handout/worksheet pairings live in that embedded book; old separate DBT HTML file URLs are redirected by the Onyx code to `skills.html#read=<pair-id>&view=<handouts|worksheets>`.

Professor Onyx and the Virtual & Health chat can suggest DBT practice and present **Add to Household tasks**. Clicking it stores the assignment topic under `ourspace.onyx.professor.tasks.v1.<profile>` and imports an idempotent account-specific `dbt_adhd` on-demand task in Household, with working handout/worksheet links. Worksheet answers and chat transcripts are not included in the Household task record. A new assignment has no invented currency reward; the user can edit the reward in Household. Optional cross-device topic sync uses the backend's existing `record.save`/`record.list` actions; the backend is not modified and live delivery was not tested.

## Source-of-truth rule

The widget's identical 18 personal/shared JSON files were **not copied**. It reads the originals already present at the exact canonical paths; `json/onyx widget/` stores only widget-specific config, DBT metadata and runtime files. The widget's game placeholder is unchanged.

## Safety and deployment notes

Do not place backend source or credentials in this static frontend. This archive includes none. Static JSON files in a **public GitHub Pages deployment are readable by anyone with their URL**, even if the site requires sign-in; private health/care data requires private hosting or authenticated server delivery for confidentiality. Because you explicitly requested local unchanged JSON, this package preserves those files and does not change the backend.

Static syntax/asset checks and isolated client unit tests passed. Browser navigation to localhost was blocked in the test environment; a real GitHub Pages test remains necessary, as does live Apps Script auth, Onyx chat, worksheet, design widget and cross-device sync verification.
