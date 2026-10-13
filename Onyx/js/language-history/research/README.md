# Language-history research modules

This directory contains source-linked ESM data for five historically related language profiles. Import `index.js` for all profiles or `getLanguageResearch(id)` for one. Each language folder exports lineage, chronology, scoped sound correspondences, prosody/syntax, orthography/Unicode and an aggregate profile. The aggregate also exposes `legacy`, retaining the previous Onyx summary fields.

`unicode-tools.js` reports code points and canonical normalization forms without stripping marks. `comparison.js` produces a side-by-side description and carries a warning against treating typological resemblance as genealogy. `root-age-audit.js` checks the sourced 2,500 BP floor and sibling entries. `validate.js` checks evidence links, age criteria, sibling/comparison counts, category coverage, and code-point examples. Run the invariant checks and local document/source audit with Node 24: `node Onyx/js/language-history/research/run-invariants.js` and `node Onyx/js/language-history/research/audit-research.js`.

Date values identify what was dated (inscription, reconstructed ancestor, archaeological calibration or written standard). The code intentionally does not implement sound-change rules as arbitrary string rewrites.


Seven added profiles live in `extended-index.js` and are checked independently by `validate-extended.js`; `all-index.js` exposes all twelve without changing the original five-profile API.
