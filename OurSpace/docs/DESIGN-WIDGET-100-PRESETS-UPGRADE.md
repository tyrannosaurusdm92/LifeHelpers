# Design widget upgrade: 100 Archive Presets

This ZIP updates the prior OurSpace starter without adding, removing, or rearranging profile modules, login, authentication, or backend functionality.

The upgraded design widget is present on both profiles and every intentionally blank destination. The new **100 Presets** tab contains exactly 100 distinct entries taken from the supplied upgraded standalone widget (91 with an original archive wallpaper URL and 9 with a substitute URL). Each entry includes an archive thumbnail link, a source page link, a category, a wallpaper link, and an OurSpace interpretation preview. **Assets remain hosted at their source URLs; screenshots and wallpapers are not embedded locally or guaranteed to remain available offline.**

Added editing controls include background image overlays, opacity, selectable patterns, text outlines and the historical-font choices. The former standalone upgrade has been absorbed into the shared Quill JS/CSS and its separate HTML file is intentionally absent.

Existing per-profile/page local storage keys (`ourspace.design.v2.<profile>.<page>`) remain compatible, so existing saves and six personal slots are preserved. Profile/module design roles are discovered from page markup; copied design applies only to compatible types. Optional server sync still depends on the already configured backend and existing proxy.

No Shadow DOM, design iframes, new backend file, new profile module or extra HTML route was introduced. The current cottage image continues as the profile design bubble; the standalone file retains its uploaded original icon artwork.

## October 31 removal update

This document describes the historical 100-entry source archive. Six user-selected entries were removed in the current release; 94 are active. The supplied choices are preserved only in `json/deleted.json`.
