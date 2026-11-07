# Quality And Change History

Consolidated source documents from the supplied OurSpace archive. Each numbered section retains its original filename and content; historical claims describe their original revision, not necessarily the current build.

## Contents
- [04_skills_workbooks_handouts_IMAGE_TAB_PASS8.md](#source-1)
- [BROWSER_RESULTS_PASS3.txt](#source-2)
- [BULLETIN-HUD-FOLLOWUP-PASS.md](#source-3)
- [IMPLEMENTATION-STATUS.md](#source-4)
- [LOSSLESS-INTEGRATION-PASS.md](#source-5)
- [LOSSLESS-VALIDATION.json](#source-6)
- [ONYX_PASS4_RETENTION_AUDIT_2026-11-02.md](#source-7)
- [OURSPACE_PRISMSHIFT_QA.json](#source-8)
- [OURSPACE_SCOPED_HUD_RECOLOR_PASS2.json](#source-9)
- [OurSpace_Correction_Audit.json](#source-10)
- [PICNIC_PANIC_PASS4_BALANCING.md](#source-11)
- [PROFILE_GRID_IMPLEMENTATION_CHECKS.txt](#source-12)
- [QA_PASS3_20261102.md](#source-13)
- [QA_PASS4_20261102.md](#source-14)
- [QA_RESULTS_PASS3.json](#source-15)
- [QA_RESULTS_PASS4.json](#source-16)
- [SECOND-PASS-BROWSER-TESTS.json](#source-17)
- [SECOND-PASS-CHANGELOG.json](#source-18)
- [SECOND-PASS-INTEGRATION.md](#source-19)
- [SECOND-PASS-VALIDATION.json](#source-20)
- [onyx-05_onyx_widget_IMAGE_TAB_PASS8.md](#source-21)
- [onyx-ADDON_BUILD_AUDIT.txt](#source-22)
- [onyx-LATEST-THREE-CAT-REVISION.md](#source-23)
- [onyx-ONYX_ADVENTURES_PROFESSOR_TESTER_2026-10-31.md](#source-24)
- [onyx-TEST-RESULTS.md](#source-25)
- [onyx-onyx_widget_STYLE_GUIDE_PASS6.md](#source-26)
- [picnic-effects-VALIDATION.md](#source-27)
- [picnic-effects-foundry-TEST_RESULTS.md](#source-28)
- [picnic-effects-prism-TEST_RESULTS.md](#source-29)
- [skills_workbooks_handouts_STYLE_GUIDE_PASS6.md](#source-30)

---

<a id="source-1"></a>

## 1. 04_skills_workbooks_handouts_IMAGE_TAB_PASS8.md

# Image tab - 04_Skills_Workbooks_Handouts

121 Wikimedia Commons direct-image links and source/license pages from `OurSpace_Interests_Free_Use_Image_Links(3).txt`. Six categories, optional interest filter, eight lazy thumbnail previews per page.

Image backgrounds apply **only to a selected surface inside the current module boundary**, never the site body or unrelated modules. For the record player, the default target is the internal now-playing display; the wood cabinet, vinyl grooves, needle and tonearm are not replaced.

Image preview, Keep and Undo use the existing module designer decision controls. Saved images are stored separately from the saved color/layout settings at `ourspace.module-design.v7.<module>.<profile>.image.v1`.

Images remain external links and are not bundled. Some image URLs can disappear or disallow hotlinking; source/license pages are always linked. Wikimedia Commons licensing does not guarantee underlying franchise rights.


---

<a id="source-2"></a>

## 2. BROWSER_RESULTS_PASS3.txt

~~~~~~~~~~~~text
PASS Main widget starts and has 3 tabs True
PASS Adventures shows 6 shortcuts True
PASS 3 original cat animation manifests load True
PASS Menu 6 opens actual Picnic button True
PASS Picnic opened inside Adventures viewport True
PASS Puzzle engine and level select load True
PASS One active board appears True
PASS All 3 full cat actors visible around board True
PASS Cat can hop into and block a real food square True
PASS Cat atlas frames applied to full actor True
PASS Connect mode actually consumes a move after valid 3+ food trace True
PASS A different level uses Match-3, never simultaneous Connect True
PASS Match-3 finds a valid adjacent swap and consumes one move True
PASS Return button restores Adventures True
PASS Leisure embeds requested Arcade URL True
PASS Leisure close restores widget True
PASS Work mode fullscreen launches True
PASS Professor is a separate hidden fullscreen True
PASS Professor exit returns to normal three-tab widget True

Runtime errors (may include external-service mocks):
Failed to read the 'localStorage' property from 'Window': Access is denied for this document.

~~~~~~~~~~~~

---

<a id="source-3"></a>

## 3. BULLETIN-HUD-FOLLOWUP-PASS.md

# Bulletin HUD follow-up pass — November 1, 2026

The previous embedded replacement retained a **dark-blue bulletin header**, **light-blue board-details strip**, and **blue menu header** in a late stylesheet override. That entire override has been removed. The embedded Bulletin now uses the reference's cream/white HUD and board strip, gold-and-red controls, and neutral cream menu header. The old blue outer profile-section title and collapse-control skin are also overridden **only on #profile-bulletins**; the enclosing section's geometry, text, and collapse behavior are left intact.

The source CSS responds to the browser viewport at 1310px by wrapping the feature navigation into five columns. Because OurSpace embeds the Bulletin inside a fixed **1180×790** design coordinate system and scales the whole module, browser-width media queries were causing the feature row to wrap and use excessive vertical space. A higher-priority, module-scoped rule now keeps **all nine feature buttons on one horizontal row** independent of the outer viewport and leaves the corkboard workspace/heart scrollbar below. The tiles remain accessible buttons, keep their descriptions, and retain gold idle/red hover/active styling.

The new rules are in `style/bulletin/bulletin_board_style.css`. Both `assets/code/william.html` and `assets/code/jasper.html` already load that shared stylesheet. No changes were made to placement settings, module dimensions, other OurSpace content, sample Post-its, assets, or bulletin save data. The latest supplied sample-reference ZIP was hash-identical to the previous reference.

Checks: DOM structure of both embedded modules and JS syntax; nine grid columns and same-row button positions at the intrinsic 1180px layout; computed header RGB/gradient and canvas footprint in a headless isolated CSS rendering. Full-site browser navigation is restricted by this environment, so actual live-site clicks still require an in-site check.


---

<a id="source-4"></a>

## 4. IMPLEMENTATION-STATUS.md

# Implementation status — October 31, 2026

## Working and locally tested in Chromium

- Landing page logo layout at desktop and phone widths, sign-in form, password reveal, forgot-password dialog, and admin-only profile chooser.
- MySpace-style William and Jasper profile structure (14 collapsible/resizable profile boxes, 75 designable profile targets including module headings and inner content).
- Native browser preview: identity editing, About Me, interests, tags, bulletins, posts, links, gallery URL entries, comments, projects, and URL-based audio player controls.
- The floating 100x100 design artwork and red X collapse, 11 color-wheel + hex pairs, font/border/background/scrollbar controls, generic and per-module design targets.
- Journal & Diary Cards now share one native two-tab page in both profile files. The original Journal and the appropriate Diary Card render with functioning UI, scoped CSS, and integrated source JS. The supplied `bulletin (1).json` layout is preserved, and its admin placement editor has been retired in favor of the Store editor.
- Feed, Visual, and Audio have their preexisting filled-in pages, but their old placement editor is retired. Household, Skills, and Communication remain unimplemented. Dino Store is native in William; Squishy Store is native in Jasper, with admin editing in William and `stores.json` export.
- Static assets, native app manifest and service worker registration logic present; installer outcome is platform/browser-dependent.

## Requires hosting/backend verification

- Real email/phone/password login and recovery verification-code delivery (not testable without the existing service and same-origin proxy).
- Private profile.get/profile.save server schema and authorizations; preview saves are device-local only.
- Cross-device designer get/save actions for profile/page-specific preferences. Local copy of compatible styles is implemented; remote sync is **conditional** on the existing backend supporting mapped actions.
- Public profile publishing and published-only public-profile retrieval.
- PWA install behavior and sync on an actual HTTPS domain, iOS, Android, desktop and tablet.

The frontend deliberately does not embed the user's Apps Script URL. A same-origin server gateway is required to contact that existing backend without placing its deployment address into browser files. This package does not include a new backend, an undocumented backend implementation or any guarantee that untested server calls will succeed.


---

<a id="source-5"></a>

## 5. LOSSLESS-INTEGRATION-PASS.md

# OurSpace native modules — integration and compatibility audit

This patch modifies the supplied integrated OurSpace archive, not the sibling LifeHelpers folders.

- All existing standalone HTML files are preserved, with no absorbed HTML resurrected.
- Household, Journal & Diary, Store, Communication, Feed, Audio, Visual, Skills and Profile are authored inside the original William and Jasper documents.
- The 102 supplied standalone DBT worksheet/handout HTML files remain in `assets/code/DBT`.
- All JS and WASM reside in `script`; all CSS in `style`, without nested top-level source folders.
- A page-scoped Quill designer is kept for each page; MySpace presets are now appearance-only, not structural templates.
- Original shared Jump Nav remains page-specific; the sidebar messenger's blue thumb follows the host page height.
- The optional sibling Onyx corpus imports from `../../Onyx/script/js/onyx/onyx-core/index.js`, and retains the existing backend-backed health, psychiatry, DBT and work responses when unavailable.
- The leisure fullscreen pane uses the one explicit game iframe exception linking to `../../../Games/index.html`.
- The supplied Apps Script backend source is **not** included or published in the frontend.
- Design account syncing uses backend `preference.get` / `preference.set` through Google Drive-backed account storage.
- PWA alert badges use the native numeric App Badging API where available. The tab icon/title displays a `‼️[#]` marker where supported; operating systems do not permit a site to draw arbitrary emoji onto all installed-app icons.
- Web push requires an authorized subscription and the backend's separately configured web-push gateway.

## Deployment and size limits

GitHub Pages must host the `OurSpace` and sibling `Onyx` and `Games` paths side by side. The hosting application must expose the published Apps Script endpoint or its secure API gateway; cross-origin Apps Script availability depends on the current deployment permissions and CORS behavior.

Do not force an arbitrary archive-size threshold by adding duplicate binaries or filler. The shipped file inventory and compressed size are reported in `docs/LOSSLESS-VALIDATION.json`.


---

<a id="source-6"></a>

## 6. LOSSLESS-VALIDATION.json

~~~~~~~~~~~~json
{
  "schema": "ourspace.lossless-integration-validation.v1",
  "generatedAt": "2026-11-01T18:56:04.760984+00:00",
  "inputArchive": "OurSpace_Final_Modules_Admin_Integrated(1).zip",
  "inputCompressedBytes": 54715966,
  "inputFiles": 547,
  "inputByteForByteUnchanged": 433,
  "inputModifiedOrRelocated": 114,
  "inputMissing": [],
  "outputFiles": 719,
  "htmlFileCount": 108,
  "htmlFilePolicy": "No additional absorbed module HTML; allowed originals and 102 DBT worksheet/handout files retained.",
  "jsCheckPassed": 178,
  "jsCheckFailed": [],
  "dirPolicy": [
    "script",
    "style",
    "assets",
    "json",
    "docs"
  ],
  "notIncluded": [
    "backend source file",
    "archive padding",
    "MySpace duplicate zip packages"
  ],
  "isolateBrowserChecks": {
    "profilesPages": [
      "william journal",
      "william communication",
      "william skills",
      "jasper household"
    ],
    "designWidget": "initialized, page-specific target counts > 0",
    "jumpNav": "single instance",
    "javascriptErrors": 0,
    "journalPresetGeometry": "unchanged at 1440x900 in a CSS/DOM isolated preview"
  },
  "hostedBackendVerified": false,
  "gitHubRepositoryModified": false,
  "installedAppIconEmojiGuarantee": false,
  "sizeTargetCompressedKB": [
    100000,
    150000
  ],
  "sizeTargetMet": false,
  "note": "Only original, nonduplicated modules and media are shipped. We have not added filler or archived absorbed HTML merely to force archive size.",
  "outputCompressedKBApprox": 58170,
  "outputCompressedKBStatus": "The actual size is shown alongside the ZIP in OurSpace_Integration_Validation.json."
}
~~~~~~~~~~~~

---

<a id="source-7"></a>

## 7. ONYX_PASS4_RETENTION_AUDIT_2026-11-02.md

# Onyx Pass 4 retention and integration audit — November 2, 2026

## Scope

Source: `Onyx_Widget_Picnic_Panic_Cat_Aware_Pass4_20261102(2).zip`.
Integration base: `OurSpace_Onyx_Native_Widget_Adventures_Picnic_Panic_Arcade(1).zip`.

This is a second-pass repair and retention check, **not** a rebuild of the separate Onyx HTML file. The widget implementation remains embedded in the existing `assets/code/william.html` and `assets/code/jasper.html`. The pre-existing standalone Onyx reference file is not loaded as the profile widget. Both profile grids remain locked and preserve their 17 module placements and dimensions.

## Features retained

- Exactly three visible widget chat tabs: **Virtual & Health**, **Leisure**, **Work**. No pin/bulletin-board actions in the widget's chat renderer.
- Isolated Onyx appearance, images, previews and widget-internal scroll region; separate blue/navy HUD and black notification/icon/sound frame. This is intentionally distinct from OurSpace's other UI.
- Virtual & Health fullscreen: **Onyx's Adventures**, including its three-cat sprites/behavior, six-button game HUD and **Picnic Panic** launched from Adventures menu button 6. Game modules were retained, not replaced.
- Leisure fullscreen: iframe URL `https://tyrannosaurusdm92.github.io/LifeHelpers/Games/index.html`, top-right **❌** to exit and return to the normal Leisure chat tab.
- Fullscreen Work and hidden fullscreen Professor Onyx therapy-support workspace, including close/return behavior.
- Professor triggers: exact phrase **“I need a session”**, existing **“I need a therapy session”** variant, and **Start Session** shown in Virtual & Health on Saturdays. Saturday timing is evaluated in America/New_York; the source's scheduled 3–4 PM window remains available without auto-launching a session.
- Chat-linked DBT worksheets and handouts, including an inline **Add to Household tasks** control without an extra OurSpace page. Household picks up tasks for the corresponding account; private therapy/diary messages are not syndicated as public Feed posts.

## Second-pass repairs

1. **Black notification frame and sounds:** mapped Onyx alert categories to the actual packaged audio files, instead of nonexistent `assets/alerts` WAVs. Added dedicated therapy and self-care reaction icons within the existing black frame. The professor's scheduled reminder goes through this one frame, not a competing notification toast.
2. **Homework handoff:** kept the shared OurSpace module bridge as the authoritative task adapter and retained source fallback. Chat messages with homework include the existing DBT hyperlink and inline task button. The UI distinguishes an on-device Household save from remote synchronization; it does not claim cloud upload unless confirmed.
3. **No chat pins:** removed leftover message-pin interactions from the widget's chat-specific renderer and hid chat-pin controls without interfering with Adventures' own game HUD positioning tools.
4. **Source retention:** added back source documents/references and DBT cover art that were absent from the earlier integrated ZIP, without overwriting native OurSpace pages. All 329 original binary media items remain byte-for-byte identical.
5. **Cache and loading:** service worker cache key advanced to v28 and its 175 referenced pre-cache files verified present. The existing `script/js` game engines and source runtime remain in use.

## Verification performed

- Both HTML profiles contain one native Onyx root, identical three-tab UI, the required fullscreen hosts, and **17** existing profile modules. All locked profile coordinates and sizes remain unchanged.
- **308 JavaScript files** passed `node --check`; **94 JSON files** parsed without errors; all **175** service-worker pre-cache files resolve.
- Onyx Adventures loader resolves **33** dependencies; Picnic Adventures bridge resolves **21** dependencies. All **329** original binary media files match the source package byte-for-byte; **80** previously absent non-runtime source files were restored.
- A restricted in-memory browser harness using embedded production markup and scripts confirmed: tabs; Saturday button visible on Saturday and hidden on Monday; exact chat trigger; Professor fullscreen open/close; Leisure iframe URL and ❌ return; DBT homework card/button/account-specific task record; therapy notification icon and audio URL; and no JavaScript errors in that harness.

## Remaining runtime limitations

The testing environment blocks live navigation to the deployed site and external arcade, so the arcade site's iframe embedding policy, full Adventures/Picnic Panic gameplay, remote chat/provider backend, browser autoplay permissions, live notifications, and cloud synchronization **cannot be certified** by this offline pass. These need deployment-environment tests. The professor feature is intended as supportive skills practice and worksheet navigation; it does not replace clinical care.


---

<a id="source-8"></a>

## 8. OURSPACE_PRISMSHIFT_QA.json

~~~~~~~~~~~~json
{
  "integration": "PrismShift 1.0 adaptive dark/light mode",
  "html_documents_injected": 108,
  "original_file_count": 1321,
  "original_files_preserved": true,
  "asset_references_checked": 324,
  "asset_references_missing": 0,
  "service_worker_cache_updated": true,
  "image_pixel_inversion_used": false,
  "image_and_corkboard_originals_preserved_by_design": true,
  "browser_fixture": {
    "dark_and_light_switch": "passed",
    "html_widget_and_hud_recolor": "passed",
    "html_gradients_recolor": "passed",
    "photo_filter_unchanged": "passed",
    "canvas_pixel_bytes_unchanged": "passed",
    "bulletin_surface_original_color_unchanged": "passed",
    "game_board_original_color_unchanged": "passed",
    "onyx_closed_state_not_forced_open": "passed",
    "css_hover_state_recomputes_without_color_drift": "passed"
  },
  "full_site_browser_navigation": "unavailable in this sandbox due to browser navigation restriction; not claimed as passed"
}

~~~~~~~~~~~~

---

<a id="source-9"></a>

## 9. OURSPACE_SCOPED_HUD_RECOLOR_PASS2.json

~~~~~~~~~~~~json
{
  "mappingEntries": 57,
  "palette": {
    "persimmon": [
      "#FFB08A",
      "#F47745",
      "#D94B24"
    ],
    "cadmium": [
      "#FFF09A",
      "#FFD12E",
      "#E9A900"
    ],
    "cyan": [
      "#99FFFF",
      "#00FFFF",
      "#00BFC4"
    ],
    "darkTeal": [
      "#6FA9A0",
      "#176B65",
      "#083F40"
    ],
    "steelBlue": [
      "#A6C4D8",
      "#5686A6",
      "#31566F"
    ],
    "mint": [
      "#C8F5DC",
      "#82DDB3",
      "#43B987"
    ]
  },
  "files": {
    "style/ourspace main/site.css": {
      "legacyLiteralCounts": {},
      "scope": "per-selector rules from attachment"
    },
    "style/design/page-fill-layout.css": {
      "legacyLiteralCounts": {},
      "scope": "per-selector rules from attachment"
    },
    "style/ourspace main/ourspace-floating-navigation.css": {
      "legacyLiteralCounts": {},
      "scope": "per-selector rules from attachment",
      "renamedHudVariables": {
        "--os-master-gold-edge": "--os-master-teal-edge",
        "--os-master-gold": "--os-master-cyan",
        "--os-master-hover-edge": "--os-master-persimmon-edge",
        "--os-master-hover": "--os-master-cadmium",
        "--os-master-red": "--os-master-persimmon"
      },
      "migratedNavigationInputBorder": {
        "from": "#8BA9C6",
        "to": "#A6C4D8",
        "basis": "Audited site form-control subtle border, now consolidated into canonical master navigation"
      }
    },
    "style/ourspace main/ourspace-unified-polish.css": {
      "legacyLiteralCounts": {
        "#A70022": 4,
        "#DF1535": 9,
        "#F7DF93": 3,
        "#856523": 3,
        "#6699CC": 2
      },
      "scope": "per-selector rules from attachment"
    },
    "style/onyx widget/ourspace-onyx-glow-up.css": {
      "changedOuterChromeColors": {
        "#003399 \u2192 #31566F": 4,
        "#336699 \u2192 #5686A6": 4,
        "#6699CC \u2192 #5686A6": 7,
        "#B1D0F0 \u2192 #A6C4D8": 2,
        "#D5E8FB \u2192 #82DDB3": 6,
        "#F8FBFF \u2192 #C8F5DC": 2,
        "#6699CC88 \u2192 #5686A688 (preserved transparency)": 2
      },
      "fullscreenSectionPreserved": true
    },
    "assets/code/onyx_widget.html": {
      "sharedBrowserThemeColor": "#31566F",
      "noChangesToGameUi": true
    }
  },
  "cssCleanup": {
    "style/game/adventures-gameplay.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/game/adventures-hud.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/game/adventures-world.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/bulletin/bulletin_board_layout.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/bulletin/bulletin_board_style.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/css/adventures-gameplay.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/css/adventures-hud.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/css/adventures-world.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/game/food-effects.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/game/foundry.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/game/meow-boards.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/game/meow-integration.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/game/onyx-adventures-integration.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/onyx widget/onyx-chat-and-ui-integration.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/css/onyx-design-studio.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/onyx widget/onyx-professor.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/onyx widget/onyx-widget-colors.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/onyx widget/onyx_widget_style.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/game/picnic-adventures.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/game/picnic-panic.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/game/picnic-studio-bridge.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/game/prism.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/game/shell.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/skills/skills_workbooks_handouts_style.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/design/design-widget.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/journal diary/journal-diary-jasper-diary.css": {
      "overriddenDeclarationsRemoved": 13
    },
    "style/journal diary/journal-diary-jasper-journal.css": {
      "overriddenDeclarationsRemoved": 3
    },
    "style/journal diary/journal-diary-william-diary.css": {
      "overriddenDeclarationsRemoved": 1
    },
    "style/journal diary/journal-diary-william-journal.css": {
      "overriddenDeclarationsRemoved": 3
    },
    "style/profile/links_module_style.css": {
      "overriddenDeclarationsRemoved": 1
    },
    "style/game/onyx-adventures-integration__original-duplicate.css": {
      "overriddenDeclarationsRemoved": 1
    },
    "style/onyx widget/onyx-design-studio.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/onyx widget/onyx-professor__original-duplicate.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/onyx widget/onyx_widget_style__original-duplicate.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/store/os-store-dino.css": {
      "overriddenDeclarationsRemoved": 1
    },
    "style/store/os-store-squishy.css": {
      "overriddenDeclarationsRemoved": 1
    },
    "style/communication/ourspace-communication-source.css": {
      "overriddenDeclarationsRemoved": 13
    },
    "style/skills/ourspace-dbt-standalone.css": {
      "overriddenDeclarationsRemoved": 8
    },
    "style/household/ourspace-final-household.css": {
      "overriddenDeclarationsRemoved": 8
    },
    "style/onyx widget/ourspace-final-onyx.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/skills/ourspace-final-skills.css": {
      "overriddenDeclarationsRemoved": 18
    },
    "style/onyx widget/ourspace-onyx-embedded-v2.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/onyx widget/ourspace-onyx-glow-up.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/profile/ourspace-profile-embedded-fit.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/ourspace-store-jasper.css": {
      "overriddenDeclarationsRemoved": 4
    },
    "style/ourspace-store-william.css": {
      "overriddenDeclarationsRemoved": 4
    },
    "style/ourspace main/ourspace-unified-polish.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/audio visual/page-audio.css": {
      "overriddenDeclarationsRemoved": 1
    },
    "style/feed/page-feed.css": {
      "overriddenDeclarationsRemoved": 1
    },
    "style/audio visual/page-visual.css": {
      "overriddenDeclarationsRemoved": 1
    },
    "style/audio visual/record_player_layout.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/audio visual/record_player_style.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/ourspace main/shell.css": {
      "status": "protected, inspected without cascade changes"
    },
    "style/communication/sidebar_messenger_style.css": {
      "overriddenDeclarationsRemoved": 21
    },
    "totalSafelyRemoved": 103,
    "removedDeadGridEditorSelectors": true,
    "removedUnusedMasterNavigationTokens": 2
  },
  "protectedExamples": [],
  "pageAudit": {
    "pagesChecked": 107,
    "inconsistentBrowserTheme": []
  },
  "validation": {
    "cssFilesChecked": 70,
    "javascriptFilesChecked": 308,
    "jsonFilesChecked": 96,
    "htmlPagesChecked": 108,
    "dbtPagesChecked": 103,
    "binaryAssetsByteIdentical": 600,
    "applicationJavaScriptByteIdentical": 307,
    "originalJSONByteIdentical": 95,
    "originalFiles": 1319,
    "newFiles": [
      "docs/OURSPACE_SCOPED_HUD_RECOLOR_PASS2.json"
    ],
    "savedModulesPerProfile": 17,
    "failures": []
  }
}
~~~~~~~~~~~~

---

<a id="source-10"></a>

## 10. OurSpace_Correction_Audit.json

~~~~~~~~~~~~json
{
  "schema": "ourspace-patch-report.v1",
  "patch": "Onyx close + light-only + MySpace presets removed + color consistency",
  "CSSChanges": {
    "dark color schemes replaced": 5,
    "dark media removed": 4,
    "dark/theme css rules removed": 448,
    "button color rules revised": 101,
    "mixed selector branches removed": 5,
    "empty css rules removed": 6,
    "navigation color substitutions": 0,
    "Onyx forced-open CSS removed": 1,
    "shared nav/HUD color substitutions": 0,
    "page shell color substitutions": 0,
    "HUD color substitutions": 0,
    "Onyx state machines repaired": 3,
    "old mode dropdowns removed": 103,
    "module MySpace presets cleared": 5,
    "MySpace layout archives cleared": 1
  },
  "changedFilesCount": 166,
  "changedFiles": [
    "style/game/foundry.css",
    "style/onyx widget/onyx_widget_style.css",
    "style/game/picnic-adventures.css",
    "style/game/picnic-studio-bridge.css",
    "style/game/prism.css",
    "style/game/shell.css",
    "style/skills/skills_workbooks_handouts_style.css",
    "style/journal diary/journal-diary-jasper-diary.css",
    "style/journal diary/journal-diary-jasper-journal.css",
    "style/journal diary/journal-diary-layout.css",
    "style/journal diary/journal-diary-william-diary.css",
    "style/journal diary/journal-diary-william-journal.css",
    "style/profile/links_module_layout.css",
    "style/profile/links_module_style.css",
    "style/onyx widget/onyx_widget_style__original-duplicate.css",
    "style/store/os-store-dino.css",
    "style/store/os-store-squishy.css",
    "style/ourspace main/ourspace-color-foundation.css",
    "style/communication/ourspace-communication-source.css",
    "style/skills/ourspace-dbt-standalone.css",
    "style/household/ourspace-final-household.css",
    "style/onyx widget/ourspace-final-onyx.css",
    "style/skills/ourspace-final-skills.css",
    "style/ourspace main/ourspace-floating-navigation.css",
    "style/onyx widget/ourspace-onyx-embedded-v2.css",
    "style/onyx widget/ourspace-onyx-glow-up.css",
    "style/ourspace-store-jasper.css",
    "style/ourspace-store-william.css",
    "style/audio visual/page-audio.css",
    "style/feed/page-feed.css",
    "style/audio visual/page-visual.css",
    "style/profile/profile-jump-nav.css",
    "style/profile/profile_modules_style.css",
    "style/audio visual/record_player_layout.css",
    "style/audio visual/record_player_style.css",
    "style/ourspace main/shell.css",
    "style/ourspace main/site.css",
    "script/onyx widget/onyx_widget_onyx-core.js",
    "script/onyx widget/onyx_widget_onyx-core.js",
    "script/onyx widget/onyx_widget_onyx-core__bubble.js",
    "script/onyx widget/onyx_widget_onyx-runtime.js",
    "script/onyx widget/onyx_widget_onyx-runtime.js",
    "assets/code/william.html",
    "assets/code/jasper.html",
    "assets/code/onyx_widget.html",
    "assets/code/DBT/001_general_worksheet_1_pros_and_cons_of_using_skills.html",
    "assets/code/DBT/002_general_worksheet_2_chain_analysis_of_problem_behavior.html",
    "assets/code/DBT/003_general_worksheet_2a_example_chain_analysis_of_problem_behavior.html",
    "assets/code/DBT/004_general_worksheet_3_missing_links_analysis.html",
    "assets/code/DBT/005_mindfulness_worksheet_1_pros_and_cons_of_practicing_mindfulness.html",
    "assets/code/DBT/006_mindfulness_worksheet_2_mindfulness_core_skills_practice.html",
    "assets/code/DBT/007_mindfulness_worksheet_2a_mindfulness_core_skills_practice.html",
    "assets/code/DBT/008_mindfulness_worksheet_2b_mindfulness_core_skills_practice.html",
    "assets/code/DBT/009_mindfulness_worksheet_2c_mindfulness_core_skills_calendar.html",
    "assets/code/DBT/010_mindfulness_worksheet_3_wise_mind_practice.html",
    "assets/code/DBT/011_mindfulness_worksheet_4_mindfulness_what_skills_observing_describing_partici.html",
    "assets/code/DBT/012_mindfulness_worksheet_4a_observing_describing_participating_checklist.html",
    "assets/code/DBT/013_mindfulness_worksheet_4b_observing_describing_participating_calendar.html",
    "assets/code/DBT/014_mindfulness_worksheet_5_mindfulness_how_skills_nonjudgmentalness_one_mindful.html",
    "assets/code/DBT/015_mindfulness_worksheet_5a_nonjudgmentalness_one_mindfulness_effectiveness_chec.html",
    "assets/code/DBT/016_mindfulness_worksheet_5b_nonjudgmentalness_one_mindfulness_effectiveness_cale.html",
    "assets/code/DBT/017_mindfulness_worksheet_5c_nonjudgmentalness_calendar.html",
    "assets/code/DBT/018_mindfulness_worksheet_6_loving_kindness.html",
    "assets/code/DBT/019_mindfulness_worksheet_7_balancing_being_mind_with_doing_mind.html",
    "assets/code/DBT/020_mindfulness_worksheet_7a_mindfulness_of_being_and_doing_calendar.html",
    "assets/code/DBT/021_mindfulness_worksheet_8_mindfulness_of_pleasant_events_calendar.html",
    "assets/code/DBT/022_mindfulness_worksheet_9_mindfulness_of_unpleasant_events_calendar.html",
    "assets/code/DBT/023_mindfulness_worksheet_10_walking_the_middle_path_to_wise_mind.html",
    "assets/code/DBT/024_mindfulness_worksheet_10a_analyzing_yourself_on_the_middle_path.html",
    "assets/code/DBT/025_mindfulness_worksheet_10b_walking_the_middle_path_calendar.html",
    "assets/code/DBT/026_interpersonal_effectiveness_worksheet_1_pros_and_cons_of_using_interpersonal_effectiveness_s.html",
    "assets/code/DBT/027_interpersonal_effectiveness_worksheet_2_challenging_myths_in_the_way_of_obtaining_objectives.html",
    "assets/code/DBT/028_interpersonal_effectiveness_worksheet_3_clarifying_priorities_in_interpersonal_situations.html",
    "assets/code/DBT/029_interpersonal_effectiveness_worksheet_4_writing_out_interpersonal_effectiveness_scripts.html",
    "assets/code/DBT/030_interpersonal_effectiveness_worksheet_5_tracking_interpersonal_effectiveness_skills_use.html",
    "assets/code/DBT/031_interpersonal_effectiveness_worksheet_6_the_dime_game_figuring_out_how_strongly_to_ask_or_sa.html",
    "assets/code/DBT/032_interpersonal_effectiveness_worksheet_7_troubleshooting_interpersonal_effectiveness_skills.html",
    "assets/code/DBT/033_interpersonal_effectiveness_worksheet_8_finding_and_getting_people_to_like_you.html",
    "assets/code/DBT/034_interpersonal_effectiveness_worksheet_9_mindfulness_of_others.html",
    "assets/code/DBT/035_interpersonal_effectiveness_worksheet_10_ending_relationships.html",
    "assets/code/DBT/036_interpersonal_effectiveness_worksheet_11_practicing_dialectics.html",
    "assets/code/DBT/037_interpersonal_effectiveness_worksheet_11a_dialectics_checklist.html",
    "assets/code/DBT/038_interpersonal_effectiveness_worksheet_11b_noticing_when_youre_not_dialectical.html",
    "assets/code/DBT/039_interpersonal_effectiveness_worksheet_12_validating_others.html",
    "assets/code/DBT/040_interpersonal_effectiveness_worksheet_13_self_validation_and_self_respect.html",
    "assets/code/DBT/041_interpersonal_effectiveness_worksheet_14_changing_behavior_with_reinforcement.html",
    "assets/code/DBT/042_interpersonal_effectiveness_worksheet_15_changing_behavior_by_extinguishing_or_punishing_it.html",
    "assets/code/DBT/043_emotion_regulation_worksheet_1_pros_and_cons_of_changing_emotions.html",
    "assets/code/DBT/044_emotion_regulation_worksheet_2_figuring_out_what_my_emotions_are_doing_for_me.html",
    "assets/code/DBT/045_emotion_regulation_worksheet_2a_example_figuring_out_what_my_emotions_are_doing_for.html",
    "assets/code/DBT/046_emotion_regulation_worksheet_2b_emotion_diary.html",
    "assets/code/DBT/047_emotion_regulation_worksheet_2c_example_emotion_diary.html",
    "assets/code/DBT/048_emotion_regulation_worksheet_3_myths_about_emotions.html",
    "assets/code/DBT/049_emotion_regulation_worksheet_4_observing_and_describing_emotions.html",
    "assets/code/DBT/050_emotion_regulation_worksheet_4a_observing_and_describing_emotions.html",
    "assets/code/DBT/051_emotion_regulation_worksheet_5_check_the_facts.html",
    "assets/code/DBT/052_emotion_regulation_worksheet_6_figuring_out_how_to_change_unwanted_emotions.html",
    "assets/code/DBT/053_emotion_regulation_worksheet_7_opposite_action_to_change_emotions.html",
    "assets/code/DBT/054_emotion_regulation_worksheet_8_problem_solving_to_change_emotions.html",
    "assets/code/DBT/055_emotion_regulation_worksheet_9_steps_for_reducing_vulnerability_to_emotion_mind.html",
    "assets/code/DBT/056_emotion_regulation_worksheet_10_pleasant_events_diary.html",
    "assets/code/DBT/057_emotion_regulation_worksheet_11_getting_from_values_to_specific_action_steps.html",
    "assets/code/DBT/058_emotion_regulation_worksheet_11a_getting_from_values_to_specific_action_steps.html",
    "assets/code/DBT/059_emotion_regulation_worksheet_11b_diary_of_daily_actions_on_values_and_priorities.html",
    "assets/code/DBT/060_emotion_regulation_worksheet_12_build_mastery_and_cope_ahead.html",
    "assets/code/DBT/061_emotion_regulation_worksheet_13_putting_abc_skills_together_day_by_day.html",
    "assets/code/DBT/062_emotion_regulation_worksheet_14_practicing_please_skills.html",
    "assets/code/DBT/063_emotion_regulation_worksheet_14a_target_nightmare_experience_form.html",
    "assets/code/DBT/064_emotion_regulation_worksheet_14b_sleep_hygiene_practice_sheet.html",
    "assets/code/DBT/065_emotion_regulation_worksheet_15_mindfulness_of_current_emotions.html",
    "assets/code/DBT/066_emotion_regulation_worksheet_16_troubleshooting_emotion_regulation_skills.html",
    "assets/code/DBT/067_distress_tolerance_worksheet_1_crisis_survival_skills.html",
    "assets/code/DBT/068_distress_tolerance_worksheet_1a_crisis_survival_skills.html",
    "assets/code/DBT/069_distress_tolerance_worksheet_1b_crisis_survival_skills.html",
    "assets/code/DBT/070_distress_tolerance_worksheet_2_practicing_the_stop_skill.html",
    "assets/code/DBT/071_distress_tolerance_worksheet_2a_practicing_the_stop_skill.html",
    "assets/code/DBT/072_distress_tolerance_worksheet_3_pros_and_cons_of_acting_on_crisis_urges.html",
    "assets/code/DBT/073_distress_tolerance_worksheet_3a_pros_and_cons_of_acting_on_crisis_urges.html",
    "assets/code/DBT/074_distress_tolerance_worksheet_4_changing_body_chemistry_with_tip_skills.html",
    "assets/code/DBT/075_distress_tolerance_worksheet_4a_paired_muscle_relaxation.html",
    "assets/code/DBT/076_distress_tolerance_worksheet_4b_effective_rethinking_and_paired_relaxation.html",
    "assets/code/DBT/077_distress_tolerance_worksheet_5_distracting_with_wise_mind_accepts.html",
    "assets/code/DBT/078_distress_tolerance_worksheet_5a_distracting_with_wise_mind_accepts.html",
    "assets/code/DBT/079_distress_tolerance_worksheet_5b_distracting_with_wise_mind_accepts.html",
    "assets/code/DBT/080_distress_tolerance_worksheet_6_self_soothing.html",
    "assets/code/DBT/081_distress_tolerance_worksheet_6a_self_soothing.html",
    "assets/code/DBT/082_distress_tolerance_worksheet_6b_self_soothing.html",
    "assets/code/DBT/083_distress_tolerance_worksheet_6c_body_scan_meditation_step_by_step.html",
    "assets/code/DBT/084_distress_tolerance_worksheet_7_improve_the_moment.html",
    "assets/code/DBT/085_distress_tolerance_worksheet_7a_improve_the_moment.html",
    "assets/code/DBT/086_distress_tolerance_worksheet_7b_improve_the_moment.html",
    "assets/code/DBT/087_distress_tolerance_worksheet_8_reality_acceptance_skills.html",
    "assets/code/DBT/088_distress_tolerance_worksheet_8a_reality_acceptance_skills.html",
    "assets/code/DBT/089_distress_tolerance_worksheet_8b_reality_acceptance_skills.html",
    "assets/code/DBT/090_distress_tolerance_worksheet_9_radical_acceptance.html",
    "assets/code/DBT/091_distress_tolerance_worksheet_9a_practicing_radical_acceptance.html",
    "assets/code/DBT/092_distress_tolerance_worksheet_10_turning_the_mind_willingness_willfulness.html",
    "assets/code/DBT/093_distress_tolerance_worksheet_11_half_smiling_and_willing_hands.html",
    "assets/code/DBT/094_distress_tolerance_worksheet_11a_practicing_half_smiling_and_willing_hands.html",
    "assets/code/DBT/095_distress_tolerance_worksheet_12_mindfulness_of_current_thoughts.html",
    "assets/code/DBT/096_distress_tolerance_worksheet_12a_practicing_mindfulness_of_thoughts.html",
    "assets/code/DBT/097_distress_tolerance_worksheet_13_skills_when_the_crisis_is_addiction.html",
    "assets/code/DBT/098_distress_tolerance_worksheet_14_planning_for_dialectical_abstinence.html",
    "assets/code/DBT/099_distress_tolerance_worksheet_15_from_clean_mind_to_clear_mind.html",
    "assets/code/DBT/100_distress_tolerance_worksheet_16_reinforcing_nonaddictive_behaviors.html",
    "assets/code/DBT/101_distress_tolerance_worksheet_17_burning_bridges_and_building_new_ones.html",
    "assets/code/DBT/102_distress_tolerance_worksheet_18_practicing_alternate_rebellion_and_adaptive_denial.html",
    "assets/code/skills.html",
    "script/ourspace main/ourspace-theme.js",
    "script/profile_modules_theme.js",
    "script/links_module_theme.js",
    "script/final-household_theme.js",
    "script/record_player_theme.js",
    "script/onyx_widget_theme.js",
    "script/onyx_widget_color-mode.js",
    "script/js/onyx_widget_theme.js",
    "script/js/onyx_widget_color-mode.js",
    "script/onyx widget/onyx_widget_onyx-ui.js",
    "script/onyx widget/onyx_widget_onyx-ui.js",
    "script/onyx widget/onyx_widget_onyx-ui__bubble.js",
    "script/onyx widget/onyx_widget_design_widget.js",
    "script/skills/final-skills-design-source.js",
    "script/design/design-widget.js",
    "script/household/final-household_design_widget.js",
    "script/skills/skills_workbooks_handouts_design_widget.js",
    "script/onyx widget/onyx_widget_design_widget.js"
  ],
  "finalPass": {
    "package": "OurSpace Light-Only Repair",
    "serviceWorkerCache": "ourspace-shell-v31-onyx-close-light-only",
    "startup": "Onyx bubble closed; popout has hidden attribute, display:none, open=false, aria-expanded=false",
    "controls": "Onyx close hides panel inline and exits fullscreen; previous stale shell cache invalidated",
    "darkMode": "Old site-wide, journal, Onyx and module switchers removed or forced to light; dark-theme CSS selectors removed",
    "myspace": "Imported gallery and built-in nostalgic theme presets removed; personal saved looks retained",
    "colors": {
      "buttons": "#FFD12E",
      "buttonBorders": "#F47745",
      "hover": "#00FFFF",
      "hoverBorders": "#176B65",
      "messengerTrack": "#176B65",
      "messengerThumb": "#F47745",
      "masterNavText": "#000000",
      "masterNavOutline": "#FFFFFF",
      "masterNavOutlineWidth": "0.075px"
    },
    "exceptions": [
      "bulletin/corkboard notes",
      "record player",
      "Onyx game HUD",
      "personal palette swatches",
      "custom folder themes",
      "danger/error meaning"
    ],
    "verification": "static JS and CSS parser checks; full deployed-site browser interaction not available in this environment",
    "additionalChanges": {
      "service_worker": 1,
      "obsolete_preset_ui": 3,
      "old_builtin_palette_engines": 3,
      "preset_widget_files": 3,
      "store_hover": 4,
      "store_button_files": 4,
      "skills_hover_files": 1,
      "gallery_clean": 1
    }
  }
}
~~~~~~~~~~~~

---

<a id="source-11"></a>

## 11. PICNIC_PANIC_PASS4_BALANCING.md

# Picnic Panic — Pass 4 · Cat-aware level generation and board safety

## Preserved integration
- The original `assets/code/onyx_widget.html` remains the only game/widget entry. The Adventures HUD, original three fullscreen widget tabs, level selector, original cat sprite manifests, visual effects and DBT pages are unchanged.
- The supplied rebalanced Picnic source has the same core `picnic-level-generator.js` as Pass 3. Pass 3 is the authoritative integration; do not copy the standalone `picnic.html` or its HUD into this project.

## Level creation, limits and relief
- 50 authored board masks are reused with seeded geometry adjustments, seeded food distribution, mode-appropriate legal opening checks, hazards, actual recipe goals, and bounded goals/moves. The board number and recipe catalog control generated content; no thousands of hardcoded boards.
- Mode is fixed per level (odd = Connect, even = Match-3), not switched mid-game. Match-3 initial boards have no auto matches; Connect requires a legal 3+ path.
- Default 45-level difficulty bands, Easy every 25 / Medium every 60 / Hard every 70 after level 135, and one deterministic Medium variation slot per ten advanced levels remain enforced with Easy > Medium > Hard > variation priority.
- Relief cat behavior is less disruptive only when the assigned difficulty is truly lower than the normal tier. Cat personality and hunger/sleepiness remain probabilistic influences rather than fixed outcomes.

## Cats in the playable board
- Onyx, Callie and Harvey remain full-size original Adventures sprite actors around the grid. The visual sprite is bigger than the single logical occupied square. They can sit, eat (without falsely granting an ingredient), leave, move nearby ingredients, and occasionally create helpful combinations.
- A cat may not settle if its chosen square would block *every* playable move. A short-lived occupied square is excluded from swaps, traces, gravity and boosters; exiting restores the hidden food or replaces eaten food from the level's existing ingredient pool.
- A Match-3 cat bat that makes a valid match triggers clearing and cascades. A Connect cat bat may resolve a newly made valid 3+ chain without giving the player Match-3 controls. Neither action consumes the user's turn.
- Cats never act while a swap is selected, a Connect trace is partially built, the player has captured a pointer, the board is paused/busy, or the game has ended.
- Booster inventory remains purchased from the shared four-currency wallet and activated only by cats; cat-triggered Match-3 booster swaps no longer alter player turn totals.
- Checkpoints created during a temporary cat visit restore an ordinary ingredient square when reopening; transitory cat positions are not persisted as broken board state.

## Cat-aware balancing tests
- 15 deterministic playtests are run per candidate board: beginner / typical / strategic players, each with no-cat, normal-cat and high-cat pressure scenarios. No trial consumes a paid booster.
- Simulated cats temporarily occupy cells, may eat foods and bat adjacent items. A candidate location is rejected if it would remove every legal move. The simulator tracks catastrophic rejections and forced releases.
- If bot results are below target, the generator adds moves and/or softens goals and hazards. A conservative no-booster fallback remains available.
- Validation exposes `catSafety`, `estimated`, `legalOpeningMoves`, `initialMatches`, and reachable objective checks under `def.generation.validation`.
- This is probabilistic playtesting, not a formal proof that every sequence of player choices must lead to a win. Runtime free reshuffle/recovery prevents permanent dead boards in ordinary play.

## Validation
- Run `node script/game/picnic-balance-tests.js` for campaign and relief-rule regression checks.
- Run `node script/game/gameplay-tests.js` for the original 3-cat career/WASM integration checks.
- The browser logic smoke test uses a local in-memory page because local HTTP navigation is blocked in this environment; this is not a deployed-host end-to-end test.


---

<a id="source-12"></a>

## 12. PROFILE_GRID_IMPLEMENTATION_CHECKS.txt

~~~~~~~~~~~~text
OurSpace profile grid implementation / source validations
- The admin editor module is loaded only by assets/code/william.html.
- Scope guard checks profile name, active profile page, private mode, and authenticated #admin preview.
- Original profile sections remain native DOM nodes, with no cloning or replacement.
- Eighteen original child elements have stable IDs and are included in the grid editor.
- Other scripts retain their packaged positioning when this editor is inactive; their size callbacks do not overwrite editor geometry after activation.
- MySpace archive skins are colors-only; archived wallpapers appear separately under background Images.
- Save & export profile.json includes moduleId, x, y, widthPx, heightPx for each editable item.
- Browser visual test is not certified in this environment; browser navigation blocked by administrator.

~~~~~~~~~~~~

---

<a id="source-13"></a>

## 13. QA_PASS3_20261102.md

# Onyx Widget + Picnic Panic · Integration Pass 3

## Scope and preservation

- Base is the reviewed Pass 2 widget archive, preserving its original Onyx's Adventures HUD, level selection, modes, effects and 3-cat Adventures assets; no external Food Frenzy shell is copied.
- Picnic Panic is integrated by lazy-loading puzzle modules into the Adventures viewport; `picnic.html` is not shipped.
- Onyx, Callie and Harvey now have independent full-sprite actors roaming around the puzzle grid and moving into occupied tiles, with spritesheet frames sourced from the same `CAT_MANIFESTS` used by Adventures. Tile occupancy, eating, batting, autonomous booster choice and wallet spend are retained.
- Widget, Work, Professor and Design Studio buttons have light-gold faces, dark-gold borders, red hover/selected state and white outlined labels; this overrides no Adventures HUD colors. Per-folder/channel/project accent choices remain independent.

## Constraints and integration notes

- The ordinary widget has exactly 3 tabs. The Professor workspace is a hidden fullscreen workflow, not a fourth tab.
- The Leisure fullscreen uses the specified external Arcade URL via iframe. Its actual rendering still depends on the remote origin allowing frames and network access.
- Homework addition uses existing Household event/storage bridge and DBT resources under `assets/code/DBT/`. Cross-app publishing requires the Household page to implement the bridge contract.
- The only main widget/game HTML document is `assets/code/onyx_widget.html`; `assets/code/skills.html` and DBT worksheet HTML files are intentionally preserved as separately linked learning resources.
- A Chromium integration harness with mocked HTTP asset routing passed **19 of 19** checks, including menu navigation, both Connect and Match-3 making valid moves, occupancy and sprite animation, level selection, and return/fullscreen paths. The harness loaded the page in an `about:blank` sandbox (normal navigations are blocked in this environment), which caused one **test-origin-only localStorage access warning**. The real hosted environment will use its normal browser origin. Remote Arcade and Household services were not end-to-end tested; they require their deployed environments.

The static package audit passed **27 of 27** checks (128 JS syntax checks, 45 JSON parses, 67 static HTML references and 21 lazy puzzle modules); the legacy gameplay regression suite passed **27 of 27** checks, including all three WASM cat engines and currency behavior.


---

<a id="source-14"></a>

## 14. QA_PASS4_20261102.md

# Onyx Widget + Picnic Panic — Pass 4 Verification

**Base:** user-provided `Onyx_Widget_Picnic_Panic_Pass3_20261102(1).zip`.
**Compared to:** user-provided `Picnic_Panic_Rebalanced_Levels(7).zip`.

## Changes

- Retained Adventures as the game shell, with Picnic Panic embedded in `assets/code/onyx_widget.html` and the sixth Adventures menu.
- Maintained both board methods as strictly separate; no restored standalone HTML, game HUD or obsolete Onyx-only booster bubble.
- Updated level algorithm from v2.1.0 to v2.2.0 with 15 seeded no-booster playtests per candidate board: 3 play styles × (2 no-cat, 2 normal-cat, 1 high-cat). The 50 authored masks, deterministic difficulty relief and existing gameplay remain.
- Defined shared difficulty-aware cat interaction settings for 1–360+ and relief levels. Onyx, Callie and Harvey retain Adventures' exact sprite sources, moods and individual personality/needs tendencies.
- Enabled cat-created Match-3 cascades and newly-created Connect chains without charging moves. Cats cannot settle on the last legal move, and cannot act during incomplete player input.
- Kept inventory purchased through shared copper/silver/gold/platinum, used only autonomously by visiting cats.
- Repaired restore behavior for checkpoint saves made while a cat was occupying or eating a tile.
- Added deterministic campaign tests and updated progression JSON/documentation.

## Test results

- **Campaign generator:** 2,567 passed checks across levels 1–360, scheduled relief priorities, one Medium level per advanced ten-level block, objectives selected from real ingredients, mode-specific legal openings, no automatic starting matches on Match-3, cat-scenario validation, and deterministic levels 375/415/435/5000/5001.
- **Existing Adventures test suite:** 27/27 passed for original cats, income, WASM and career operations.
- **Browser game-logic test:** level selector rendered 45 levels; Level 1 = Connect, initial 32 moves, 3 visual cat actors, 1 occupied logical cell and a legal move after occupancy; cat departures restored/refilled without leaving null tiles; Level 2 = Match-3 with a valid adjacent swap and zero opening auto matches; cat-made Match-3 combination scored 45 and did not spend a player move; zero uncaught JavaScript errors in the isolated browser-logic harness.
- **Package audit:** all JavaScript syntax checks and JSON parses passed; original allowed folder structure, one widget/game HTML entry plus required DBT/skills pages, all static asset references and lazy puzzle modules present; no forbidden executable files.

## Limits

- The browser game-logic test uses an isolated HTML test harness with local module contents injected because the environment blocks localhost/browser navigation. It is not a deployed, end-to-end test of the full widget, GitHub Pages, arcade, backend or external integrations.
- Seeded randomized simulation provides a conservative estimate of level achievability, not a proof that every arbitrary player strategy or sequence of random refills will succeed.
- The progression generator version change regenerates old v2.1.0 board plans; completed-level/unlock records are retained in the existing profile progress storage. Full checkpoint saves from older generation versions restart the same level on a newly balanced board.


---

<a id="source-15"></a>

## 15. QA_RESULTS_PASS3.json

~~~~~~~~~~~~json
{
  "checks": [
    [
      "Single widget/game entry, with required linked DBT/skills documents",
      true
    ],
    [
      "Only allowed root directories",
      true
    ],
    [
      "No forbidden nested directories",
      true
    ],
    [
      "No Windows batch / app / other main HTML",
      true
    ],
    [
      "Exactly 3 widget tabs (Virtual & Health, Leisure, Work)",
      true
    ],
    [
      "Exactly 6 Adventures menu shortcuts",
      true
    ],
    [
      "6 menu opens one Picnic Panic button",
      true
    ],
    [
      "Original Adventures viewport plus embedded Picnic viewport",
      true
    ],
    [
      "Picnic return and booster store controls",
      true
    ],
    [
      "Leisure external arcade iframe with close button",
      true
    ],
    [
      "Work and hidden Professor fullscreen with close buttons",
      true
    ],
    [
      "Widget black avatar frame and sounds retained",
      true
    ],
    [
      "Professor session phrase and Saturday button",
      true
    ],
    [
      "In-chat DBT household assignments bridge",
      true
    ],
    [
      "Picnic lazy integration uses Adventures game and no standalone HUD",
      true
    ],
    [
      "No standalone Arcade or Picnic game HUD loaded",
      true
    ],
    [
      "Cat actors created outside board food cells",
      true
    ],
    [
      "Real cat atlas sprites available for all 3",
      true
    ],
    [
      "Purchased autonomous booster inventory supports four coin types",
      true
    ],
    [
      "No passive Onyx booster bubble loaded",
      true
    ],
    [
      "Only official button palette and precise stroke specified",
      true
    ],
    [
      "Widget CSS avoids game HUD",
      true
    ],
    [
      "Arcade URL exactly matches requested",
      true
    ],
    [
      "Every static HTML script/style/image link resolves",
      true
    ],
    [
      "All lazy Picnic JS modules exist",
      true
    ],
    [
      "All 128 JS files pass node --check",
      true
    ],
    [
      "All 45 JSON files parse",
      true
    ]
  ],
  "warnings": [],
  "counts": {
    "files": 700,
    "js": 128,
    "json": 45,
    "dbt_html": 103,
    "static_refs": 67,
    "lazy_js": 21
  }
}

~~~~~~~~~~~~

---

<a id="source-16"></a>

## 16. QA_RESULTS_PASS4.json

~~~~~~~~~~~~json
{
  "release": "Picnic Panic / Onyx Widget Pass 4",
  "generatorVersion": "2.2.0",
  "campaignChecks": 2567,
  "campaignChecksPassed": 2567,
  "adventuresGameplayChecks": 27,
  "adventuresGameplayChecksPassed": 27,
  "browserSmoke": {
    "environment": "isolated in-memory Chromium harness",
    "connectLevel": 1,
    "match3Level": 2,
    "levelSelectNodes": 45,
    "catSpriteActors": 3,
    "liveOccupancyPreservesLegalMoves": true,
    "catDepartureLeavesNoUnfilledCells": true,
    "match3InitialMatches": 0,
    "catCreatedMatchCostsPlayerMove": false,
    "uncaughtPageErrors": 0
  },
  "deploymentSmokeTest": "not performed; browser blocks localhost navigation and live external services were not tested"
}

~~~~~~~~~~~~

---

<a id="source-17"></a>

## 17. SECOND-PASS-BROWSER-TESTS.json

~~~~~~~~~~~~json
[
  {
    "designer": true,
    "totalTargets": 135,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "william",
    "page": "profile",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 169,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "william",
    "page": "journal",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 146,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "william",
    "page": "store",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 151,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "william",
    "page": "communication",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 90,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "william",
    "page": "household",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 86,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "william",
    "page": "skills",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 81,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "william",
    "page": "audio",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 81,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "william",
    "page": "visual",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 81,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "william",
    "page": "feed",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 135,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "jasper",
    "page": "profile",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 169,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "jasper",
    "page": "journal",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 146,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "jasper",
    "page": "store",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 151,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "jasper",
    "page": "communication",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 90,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "jasper",
    "page": "household",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 86,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "jasper",
    "page": "skills",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 81,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "jasper",
    "page": "audio",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 81,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "jasper",
    "page": "visual",
    "geometryDeltaPx": 0,
    "errors": []
  },
  {
    "designer": true,
    "totalTargets": 81,
    "widgetCount": 1,
    "jumpCount": 1,
    "onyxSelectors": 1,
    "profile": "jasper",
    "page": "feed",
    "geometryDeltaPx": 0,
    "errors": []
  }
]
~~~~~~~~~~~~

---

<a id="source-18"></a>

## 18. SECOND-PASS-CHANGELOG.json

~~~~~~~~~~~~json
{
  "changes": [
    [
      "script/skills/final-dbt-onyx-assignments.js",
      60712,
      58774
    ],
    [
      "json/onyx widget/onyx_widget_pairings.json",
      142091,
      142091
    ],
    [
      "json/skills/final-dbt-pairings.json",
      142091,
      142091
    ],
    [
      "assets/code/skills.html",
      307747,
      307747
    ],
    [
      "script/design/design-widget.js",
      250208,
      250791
    ],
    [
      "script/communication/sidebar_messenger_messenger.js",
      78690,
      79384
    ],
    [
      "assets/code/design-widget.html",
      "absorbed standalone removed",
      0
    ],
    [
      "service-worker.js",
      8907,
      9017
    ],
    [
      "docs/README.md",
      10935,
      10924
    ],
    [
      "docs/DESIGN-WIDGET-100-PRESETS-UPGRADE.md",
      1840,
      1862
    ]
  ]
}
~~~~~~~~~~~~

---

<a id="source-19"></a>

## 19. SECOND-PASS-INTEGRATION.md

# OurSpace second lossless / replacement pass

This release starts with the previous lossless package and rechecks it against both original inputs. The original module files are preserved in-place or mapped to their integrated equivalents; no standalone HTML was recreated for any absorbed module.

## Concrete repairs

* The 102 worksheet and handout links in Onyx's DBT assignment scripts now point to `assets/code/DBT/` through `DBT/<name>.html` relative to the permitted profile/widget HTML pages. Case matters when hosted on GitHub Pages.
* The JSON pairing catalogs use the correct `assets/code/DBT/` case.
* The Quill Designer routes the floating Onyx widget controls to the actual `#osOnyxNativeRoot` outside the Journal/Communication page container.
* Historical MySpace visual presets leave text-element background fills intact. No old MySpace DOM, column grids, sizes, ordering, or layout transforms are imported.
* The messenger rail's single page scrollbar responds to dynamic content mutations and resizing.
* The original standalone `assets/code/design-widget.html` was already absorbed into common JS and CSS and is intentionally **not shipped**. The original in-page Quill design features are kept.
* The service-worker shell cache list is updated, without caching private backend responses.

## Integration boundaries

* `OurSpace` is the only deployable folder in this ZIP. The existing `Onyx` brain and `Games` arcade are referenced as sibling directories; their source is not copied into OurSpace.
* The supplied Apps Script backend is **never** bundled. Account profile storage and badge counts use the published backend actions; these are not a guarantee of live provider configuration.
* Browser and OS platform rules control PWA app badges. A numeric app badge can be requested when supported; an arbitrary `‼️[#]` emoji overlay cannot be guaranteed on all installed app icons. The visual favicon/tab fallback is supported.
* The current Onyx backend supports psychiatry-adjacent support, DBT, health, and work modes. A clinical support bot is not a substitute for a licensed clinician.
* GitHub main is not changed by the downloadable ZIP. A complete directory replacement requires a repository commit containing **every** binary and text asset. Do not push only the small JS fixes and delete the old OurSpace tree; the site would break.

## Size requirement

A 100,000–150,000 KB compressed target cannot be satisfied by the original, non-duplicated code and assets currently supplied. Shipping duplicate media, archives, unlicensed material, or dummy padding would break the lossless/de-duplicated and directory-contract requirements. The audit report records the actual ZIP size.


---

<a id="source-20"></a>

## 20. SECOND-PASS-VALIDATION.json

~~~~~~~~~~~~json
{
  "schema": "ourspace.lossless-replacement-pass2.v1",
  "basePackage": "OurSpace_Lossless_Integration_Pass.zip",
  "crossCheckedOriginal": "OurSpace_Final_Modules_Admin_Integrated(2).zip",
  "originalFiles": 547,
  "originalByteIdentical": 427,
  "originalModifiedOrRelocated": 119,
  "originalMissingUnaccounted": [],
  "intentionalAbsorbedHtmlRemovals": [
    "assets/code/design-widget.html"
  ],
  "releaseFileCount": 721,
  "releaseHtmlCount": 107,
  "releaseDBTHtmlCount": 102,
  "javascriptFilesSyntaxPassed": 178,
  "jsonFilesParsed": 71,
  "localHtmlReferencesChecked": 1142,
  "serviceWorkerCachePathsVerified": 152,
  "browserTestsFile": "docs/SECOND-PASS-BROWSER-TESTS.json",
  "browserTestScope": "Isolated DOM with original HTML and CSS, shared Quill JS injected. Not production backend calls.",
  "githubRepositoryReplaced": false,
  "gitHubOnlyOurSpaceTarget": true,
  "siblingFoldersModified": false,
  "backendFileIncluded": false,
  "backendDeployedOrTested": false,
  "installedAppOSBadgeGuarantee": false,
  "targetCompressedKB": [
    100000,
    150000
  ],
  "errors": [],
  "browserPagesTested": 18,
  "browserErrorsReported": 0,
  "browserGeometryRegressions": 0
}
~~~~~~~~~~~~

---

<a id="source-21"></a>

## 21. onyx-05_onyx_widget_IMAGE_TAB_PASS8.md

# Image tab - 05_Onyx_Widget

121 Wikimedia Commons direct-image links and source/license pages from `OurSpace_Interests_Free_Use_Image_Links(3).txt`. Six categories, optional interest filter, eight lazy thumbnail previews per page.

Image backgrounds apply **only to a selected surface inside the current module boundary**, never the site body or unrelated modules. For the record player, the default target is the internal now-playing display; the wood cabinet, vinyl grooves, needle and tonearm are not replaced.

Image preview, Keep and Undo use the existing module designer decision controls. Saved images are stored separately from the saved color/layout settings at `ourspace.module-design.v7.<module>.<profile>.image.v1`.

Images remain external links and are not bundled. Some image URLs can disappear or disallow hotlinking; source/license pages are always linked. Wikimedia Commons licensing does not guarantee underlying franchise rights.


---

<a id="source-22"></a>

## 22. onyx-ADDON_BUILD_AUDIT.txt

~~~~~~~~~~~~text
ONYX'S ADVENTURES — BUILD AND PACKAGING AUDIT
Build date: 2026-11-01

Archive output: Onyx_Adventures_Finch_AnimalCrossing_Sims2Pets_Careers_Biomes_Integrated.zip
Uncompressed total: 25,815,577 bytes
Original ZIP source: Onyx_Adventures_75pct_Bigger_Trees_3pct_Per_Awake_Cat(3).zip
Original files inspected: 147
Original files retained unmodified: 144
Original files intentionally modified: adventures.html, docs/README.md, script/game/app.js
New files: 24
New file bytes (including comprehensive dossier, vendor code, docs and data): 560,927 (547.78 KiB)
Source file restriction: PASS (one HTML, root and five flat directories only)
No .py/.pyc/.bat/.cmd/.app/.exe: PASS
JavaScript parsers: PASS (35 JS files)
JSON parsers: PASS (11 JSON files)
All HTML JS and CSS references: PASS
Original core WASM, cat rendering and bird-hunting code unchanged: PASS
Pure JS + compiled WASM math behavior tests: 27 PASS
Visual browser live-rendering: NOT VERIFIED (ERR_BLOCKED_BY_ADMINISTRATOR)
Actual authenticated deployed backend transaction: NOT VERIFIED (not accessed with real credentials)
User's requested >=15,000 KB new programming: NOT MET.
Reason: compact useful runtime integrated, rather than inserting unrelated test fixtures/assets from huge development repos. No invented count or misleading padding.

Original retained core files keep all 21 cat-bird contact images, original sprites and pet engines intact.
There is no replacement/forked backend. No original backend code ships in this archive.

~~~~~~~~~~~~

---

<a id="source-23"></a>

## 23. onyx-LATEST-THREE-CAT-REVISION.md

# Latest implemented change — cat scale, tree scale, care frames, catch chances

The authoritative user correction is **3% independently PER AWAKE CAT** every
300 active seconds, not a shared 3% for the whole group. This expressly
supersedes the shared-roll rule in the attached COMPLETE master dossier.

## Size / rendering
- Trees are rendered at **1.75 times the previous build's height and width**;
  the image pixels stay original. The draw multiplier changed from 1.75 to
  3.0625. All tree base positions and ground obstacles retain the same depth
  order; trees remain the last scenic objects, above water/logs.
- Cats render at Onyx **88px**, Callie **76px**, Harvey **66px** nominal atlas
  cell height, always sharing the flat walking line 25px below tree bases.
  The user-provided coat colors, transparent alpha and 21 contact PNGs
  are unchanged.

## 300-second hunting window
- Every active, unpaused five minutes opens one 90-second low-flying window.
  About two-thirds of birds descend and then climb again.
- At most one independent 3% random draw is made for each available awake
  cat **within that specific window**. All available cats get one visible
  hunting jump even if their individual probability roll fails.
- Sleeping, eating, drinking, grooming, meowing, ongoing care cues and
  other occupied activities are never interrupted. A cat can join during
  the window when it finishes its previous action. No attempts occur while
  paused or backgrounded.
- A probability success **does not** cause feathers or a catch by itself.
  Only a real airborne paw or mouth overlapping an opaque pixel of the
  specific bird being targeted can show the matching provided cat-contact
  sprite. No free-floating explosion assets exist.

## Animation
- Cat scripts use state-level animation transitions instead of resetting
  per WASM frame update. Nonempty cells across the three atlases are
  represented in animation manifests. Callie's full stretch includes cell
  15; Harvey's crouch now uses the available cells 11–12. Idle, walk, run/zoom, play, crouch, pounce, stretch, groom, yawn,
  talk, and settle are available as appropriate for each cat.
- Need-triggered eating **24/25/26** and drinking **28/29/30** play to
  completion on all three cats. Hunger and thirst remain independent;
  completing the sequence resolves only the relevant need. The frames
  already include each cat's uniquely colored dish.

No changes were made to the 21 attached contact art files, bird source art,
meow audio, HUD, tents or WASM binaries.


---

<a id="source-24"></a>

## 24. onyx-ONYX_ADVENTURES_PROFESSOR_TESTER_2026-10-31.md

# Onyx Widget: Adventures, Professor fullscreen, tester client

## What changed

- The existing Virtual & Health fullscreen now launches **Onyx's Adventures**, intentionally **blank** except for its exit control. No previous game code, art, or scenes were added.
- **Professor Onyx** is a new, hidden fullscreen workspace. It follows the visual organization of Work mode, using a rail, focused therapy/DBT sections, session subtabs, message area, prompt chips, editable subtab names, user-selected worksheet/document attachments (up to four 9 MB files), and export/clear/delete actions. Attachments are parsed by the unchanged authenticated backend; they are disabled in read-only tester mode. Work itself remains separate and unchanged.
- Professor can be started by saying **“I need a therapy session”** in the Virtual & Health chat, selecting the **Professor** control in its Conversation Modes, calling `window.OnyxProfessor.open()` from a trusted UI action, or dispatching `onyx:professor-trigger` after an explicit user action. Merely mentioning distress, the existence of a therapy appointment, or the schedule never automatically switches modes.
- **Every** fullscreen exit X (Adventures, Leisure, Work, Professor, and legacy widget fullscreen) uses a red background; X returns to the floating module.
- `script/onyx widget/onyx-tester.js` implements the **existing backend** `onyx.tester.*` read-only tester contract: request six-digit code, verify, choose William or Jasper, chat, read session state, exit. It never embeds a backend source file or private server-side context. Its verified token remains in session storage only, expires under the three-hour server-issued period, and is never exposed in its public status object.

## Saturday therapy sessions / alerts

The supplied backend source specifies **a separate Saturday session for William and Jasper at 3–4 PM America/New_York**, including the appropriate Eastern Daylight Time and Eastern Standard Time offsets. The backend queues **2:30 PM** and **3:00 PM** in-app/email reminders for each account and optional push/SMS when separately subscribed. The new UI polls the existing `onyx.therapy.alerts` action when signed in and also offers a foreground in-app reminder while the widget is open. Reminders can open Professor **only when a user clicks** “Start Professor session.”

**Important:** Browser-side in-app reminders work only while the webpage/app is running. Email and background delivery depend on the already-deployed backend's `ONYX_THERAPY_REMINDER_TICK` trigger and alert configuration; this frontend build cannot install that trigger or verify live email/push delivery. The supplied backend defines the existing `OURSPACE_V1_INSTALL_ONYX_THERAPY_TRIGGER()` and `onyx_tester_profile()` setup/test functions; no backend implementation was changed or included. Apps Script time triggers can run a few minutes late.

## Health, security and privacy boundaries

Professor is AI-assisted psychological support, psychoeducation, and DBT skills coaching, **not a licensed psychiatrist**, emergency service, or substitute for clinical care. The client never sends one profile's tester data to the other. Professor transcripts are kept only in browser memory (not Work mode's `localStorage`) while the page is open; the existing authenticated backend may still retain conversations under its established private account rules. Export is an explicit user action. The backend remains the authority for account access and read-only tester permissions. If not signed in and not a verified tester, the chat asks for appropriate access.

## Files

- `onyx_widget.html` — one existing HTML entrypoint; added Professor fullscreen and linked two new JS files and stylesheet.
- `style/onyx widget/onyx-professor__original-duplicate.css` — focused Work-style Professor layout, red fullscreen exit buttons, responsive sidebar, and in-app reminder.
- `script/onyx widget/onyx-professor.js` — Professor conversation UI, explicit trigger detection, independent subtabs, user-initiated attachment parsing, timer display, and therapy alert polling.
- `script/onyx widget/onyx-tester.js` — frontend-only existing tester backend contract adapter.
- `script/onyx widget/onyx_widget_shared-runtime.js` — fourth fullscreen runtime mode and safe exit/visibility transitions.
- `script/onyx widget/onyx_widget_onyx-core.js` — explicit chat phrase handling and tester messages in the Health widget.
- `script/onyx widget/onyx_widget_onyx-ui.js` — Adventures launcher caption and Professor button.
- `script/onyx widget/onyx_widget_shared-shells.js` — Adventures shell focus mapping.

## Testing performed

JavaScript syntax checks succeeded for the changed runtime, widget, tester, and Professor scripts. Isolated Chromium tests with mocked backend responses confirmed: entering/exiting the blank Adventures view, entering/exiting Work and Professor, the red X styling, four Professor sections, subtab creation, message submission and rendering, and an explicit phrase opening check. This **does not** claim a live deployed backend or notification trigger was verified: those require authenticated end-to-end testing against the deployed OurSpace project.


---

<a id="source-25"></a>

## 25. onyx-TEST-RESULTS.md

# Latest browser test results

- Loading: 61 of 61 required scenery / bird / attached-contact PNG images.
- Three independent WASM cats loaded and rendered.
- Renderer diagnostics: 0 failures.
- Contact PNG load/draw matrix: 3 cats × 7 species = 21 passes.
- Negative safeguards: zero-jump, sleep, drink cue, eat cue, wrong contact
  type, missing bird, no spontaneous explosion or separate feather actors.
- Simulated full collision: Onyx paw + bluejay opaque pixels -> one catch,
  contact pose drawn on cat, pending catch consumed, no standalone burst.
- Runtime retains 300-second recurring active-timer and 90-second low flight
  windows, and one independent 3% chance roll for each eligible awake cat.

## Current actual browser regression tests
- Full page loaded: 61/61 image assets, no missing URLs, zero JS page errors.
- All world self-tests passed with three live WASM cats.
- Tree visual size multiplier changed from 1.75 to 3.0625: **75% larger**.
- Cat render heights verified **88px Onyx > 76px Callie > 66px Harvey**.
- 300s window produced exactly 3 independent rolls for three available cats.
- Forced 3% RNG samples `.02, .08, .009` independently authorized cats
  1 and 3 only (not a shared success); one visible jump per cat occurred.
- Zero actual collisions yielded zero caught birds, even on authorized rolls.
- Second five-minute window with one ineligible cat produced only two rolls.
- Paused interval froze simulation bird-catching time.
- Each actual cat WASM runtime exercised eating frames **24, 25, 26** and
  drinking frames **28, 29, 30** during need-triggered care interactions;
  those care scenes finished and updated hunger/thirst separately.
- Every nonempty atlas frame is declared by a real animation. Missing
  Callie stretch frame 15 was added to the stretch animation, and Harvey's
  crouch frames 11–12 are now reachable through her quiet behavior choices.


---

<a id="source-26"></a>

## 26. onyx-onyx_widget_STYLE_GUIDE_PASS6.md

# 05_Onyx_Widget — CSS and theme guide (Pass 6)

The module's only CSS file is **`style/onyx widget/onyx_widget_style__original-duplicate.css`**. Its entrypoint is `onyx_widget.html`. Do not re-add older `*_myspace.css`, `*_readability.css`, or `*_inline-style.css` files; they are obsolete.

Current CSS includes the module's visual base, functional UI geometry, accessible focus treatment and mutually exclusive light/dark theme rules. Behavior is implemented by the existing JS assets in this folder.

Legacy static images and transparent bubble are preserved; fullscreen Work behavior remains in JavaScript.

These source files have not been copied from freewebsitetemplates.com; that site served as visual design inspiration only.


---

<a id="source-27"></a>

## 27. picnic-effects-VALIDATION.md

# Merged studio checks — November 2, 2026

- Both uploaded ZIP archives were inspected, including their internal file manifests and per-file checksums.
- The merged package contains exactly one `.html` file: `assets/code/effects.html`.
- Source data contains **58 Visual FX Foundry** and **33 PRISM** presets, totaling **91 selectable catalog entries**. Neither preset catalog was dropped.
- The two compiled `.wasm` binaries and original C source files are included, together with the original engine-specific JavaScript and CSS.
- Browser smoke tests using a script-inlined test harness confirmed **both editors initialize**, **Foundry WASM is active**, **PRISM WASM is active**, **all 91 combined catalog entries display**, and the combined timeline can switch between editors.
- A PRISM interaction smoke test selected the original `draw-lines` preset and verified its connect board is active. The parent studio received the child editor's selected preset via `postMessage`, and adding a combined cue used that selection. A project snapshot included both engines' configurations.
- The browser environment blocked direct filesystem/localhost navigation by an administrator URL policy, so full distribution-path browser loading could not be exercised there. Tests used the exact embedded scripts/styles loaded into a temporary document rather than direct navigation. Relative file references were verified statically.
- A prolonged all-91-presets rendering test timed out, so this is **not** a claim that every individual effect was visually verified.

The tests do not certify cross-browser compatibility, every effect's exact appearance, or all download mechanisms. Use a normal static web host for further end-to-end verification.


---

<a id="source-28"></a>

## 28. picnic-effects-foundry-TEST_RESULTS.md

# Tests performed

- Clang 17 compiled `script/wasm/effects_core.c` into a freestanding WebAssembly binary successfully.
- Node.js instantiated that binary with **zero imported modules** and validated exports `fx_init`, `fx_config`, `fx_emit`, `fx_step`, `fx_count`, `fx_ptr`, `fx_stride`, `fx_noise`, `fx_clear` and linear memory. Emitting 100 particles, stepping, and reading the 12-value struct succeeded.
- Node.js ran a mocked Canvas 2D player smoke test, selecting and rendering **all 58 presets**, then executing a two-step event sequence. All ran without JS exceptions in the test harness.
- JavaScript syntax was checked using `node --check` for the studio controller, audio, exporter and renderer modules.
- A browser with embedded runtime assets successfully downloaded and parsed a complete `effects-studio/v1` JSON config (5 sequence events, 6 palette entries), a 1440×606 RGBA 12-frame PNG sprite sheet, and a separate 6-step timeline JSON, with zero page exceptions. The rainbow-color gradient was corrected after this test exposed an unsupported CSS color suffix.
- Automated Chromium direct navigation to localhost or `file://` URLs was blocked by the test environment. A separate **inline-asset browser harness** did render the complete UI with the real WASM embedded as a data URL, verified 58 library buttons, five timeline rows, switched to the Draw category (8 effects), selected Sugar Connect, paused the simulation, added a timeline step, captured a screenshot, and reported **zero page exceptions**. A normal deployed HTTP launch still requires testing on the target host.

These are smoke tests, not a guarantee of performance on every mobile device. Extremely dense settings can reduce FPS on lower-end GPUs/CPUs. Test in each target game's layout and performance envelope before shipping.


---

<a id="source-29"></a>

## 29. picnic-effects-prism-TEST_RESULTS.md

# QA — 2026-11-02

Automated browser harness used Chromium's Canvas 2D and a Playwright script with inline script injection. The sandbox browser blocks direct HTTP/file navigation, so the harness injected the same project HTML/CSS/scripts into a browser document. This checks the executing JavaScript and WASM, but does not replace a manual check of hosted asset URLs or a user browser's recording codec support.

Checks executed:

- All eight script files passed `node --check` syntax verification.
- `physics.wasm` instantiated successfully and exports all numerical functions and memory.
- The browser selected each of 33 presets, triggered it, advanced the animation and painted a frame without an exception.
- The `WebAssembly` bridge was active rather than the fallback.
- Connect board found a valid chain, removed three same-color pieces and scored 30 points.
- Match-3 board found a valid adjacent swap and scored a successful 30-point match.
- Bubble board launched and resolved a shot without leaving a stuck moving projectile.
- Configuration export described the current preset using `prism-effect/v1` format.
- Transparent render generated a valid PNG data URL from the canvas.
- JSON download exported a valid `prism-project/v1` object with settings and cues.
- PNG frame download produced a valid image.
- PNG sprite-sheet download produced a 4×4 atlas with 16 successive frames.
- Browser page-error list remained empty in both effect and export tests.

See `docs/README.md` for feature scope. On your own browser, verify that the selected media backdrops load from `assets/images` after extraction and that WebM capture works for the browser's supported codec.


---

<a id="source-30"></a>

## 30. skills_workbooks_handouts_STYLE_GUIDE_PASS6.md

# 04_Skills_Workbooks_Handouts — CSS and theme guide (Pass 6)

The module's only CSS file is **`css/skills_workbooks_handouts_style.css`**. Its entrypoint is `skills_workbooks_handouts.html`. Do not re-add older `*_myspace.css`, `*_readability.css`, or `*_inline-style.css` files; they are obsolete.

Current CSS includes the module's visual base, functional UI geometry, accessible focus treatment and mutually exclusive light/dark theme rules. Behavior is implemented by the existing JS assets in this folder.

This is the Skills exception: all 102 worksheet/handout documents share this stylesheet. Native worksheet-specific appearance controls remain active.

These source files have not been copied from freewebsitetemplates.com; that site served as visual design inspiration only.

