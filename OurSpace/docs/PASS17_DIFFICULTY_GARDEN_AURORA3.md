# Pass 17 — difficulty flow + Garden authority + Aurora pass 3

## Recipe / Garden difficulty

- Six live difficulty bands: Super Easy, Easy, Medium, Hard, Super Hard, Expert.
- Core ingredient count excludes sauces, seasonings, and herbs.
- Core recipe bands: 2–3 / 3–5 / 5–7 / 8–10 / 11–14 / 15–18.
- Every catalog ingredient carries `minimumDifficulty` and `gardenMinimumDifficulty`.
- All fish/seafood begin at Medium or above.
- Recipe Generator selects the exact target difficulty for the selected account level.
- Ingredient Garden fallback selection uses the same six-band mapping.
- Garden required objectives and filler pools both obey the active recipe tier.
- Garden unit scaling uses the recipe core-ingredient count rather than counting sauces/herbs as core complexity.

## Aurora pass 3

The browser WASM visual kernel continues to be derived from the uploaded AuroraSim donor concepts. Pass 3 adds visual analogues for charge density, electric-field gradient, velocity rescaling, deterministic particle respawn, and periodic boundaries on top of the previous emission/lifetime/density/energy/drift curtain model.

The Garden renderer uses those values for field-curved traces, directional halos, re-spawning particles, energy-normalized particle movement, periodic shuffle bands, and charge-weighted cell glows. All are code-rendered; no raster burst/effect sprites are restored.
