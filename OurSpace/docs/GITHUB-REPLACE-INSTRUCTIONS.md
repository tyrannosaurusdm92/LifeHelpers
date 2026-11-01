# Replace only LifeHelpers/OurSpace on GitHub

**This ZIP is not deployed; the GitHub repository is unchanged.** It contains the new OurSpace directory contents, not the sibling Onyx or Games projects.

1. Back up the current `OurSpace` directory or create a working branch first.
2. In a local checkout of `tyrannosaurusdm92/LifeHelpers`, replace **only** the existing `OurSpace` directory with this ZIP's root files and folders. Do not delete or move `Onyx`, `Games`, or any sibling directory.
3. Confirm the resulting path `LifeHelpers/OurSpace/ourspace.html` and its sibling paths `LifeHelpers/Onyx/...` and `LifeHelpers/Games/index.html` exist.
4. Review diffs, run the JavaScript syntax and link audits, commit, and push. The old `css/` and `js/` directories within `OurSpace` are intentionally replaced by `style/` and `script/`.
5. Deploy from the root `LifeHelpers` site (e.g. GitHub Pages) so relative Onyx and Games links resolve. Verify account login, Web App CORS/permissions, Drive persistence, PWA install badges, push gateway, and live messaging in two separate accounts and browsers.

Do not publish the supplied Apps Script backend `.txt` or its secrets. The frontend uses the existing published Web App contract only.

A deployment cannot be called complete until the production backend and the installed-app notification behavior are verified on target devices. See `LOSSLESS-VALIDATION.json`.
