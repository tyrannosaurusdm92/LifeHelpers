# OurSpace Revised Package

This package is the lighter OurSpace app build.

## Entry points

- `OurSpace.html` — login, signup, reset password, and admin test links.
- `william.html` — William's full duplicated user page.
- `jasper.html` — Jasper's full duplicated user page.

## DBT / ADHD placement

Actual DBT/ADHD docs, worksheets, handouts, and skill files are not included in this package. The shared placeholder locations are:

- `json/shared/skills.json`
- `json/shared/skills/dbt/PLACEHOLDER.json`
- `json/shared/skills/adhd/PLACEHOLDER.json`

Future lightweight resource entries can be added to `json/shared/skills.json`. User-specific skill files under `json/william/skills.json` and `json/jasper/skills.json` are intentionally empty and point back to shared storage.

## Games and currency

The old standalone currency ledger and play-to-win hub pages are no longer needed. Their user-facing pieces are directly embedded in both `william.html` and `jasper.html`. Active game files remain in `modules/games/`, with reward/bot support in `assets/`.

## Docs policy

Old legacy/source files that are not directly used by the app were removed and catalogued instead of shipped as runnable code. See `docs/MANIFEST.json` and `docs/AUDIT.md`.
