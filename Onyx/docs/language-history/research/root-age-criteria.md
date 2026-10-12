# Root-age criteria and evidence audit

## Criterion

The requested comparison floor is 2,500 years. This dataset records the ancestor or family stage used to meet that floor; it does not claim that each present-day language has existed unchanged for that long. Years BP use the archaeological convention of 1950 CE. Dates in BCE are given as historical ranges where the source does not support a point estimate.

| Selected language | Ancestor or family stage | Age evidence used | Comparison relatives | Limit |
|---|---|---|---|---|
| Spanish | Archaic Latin / early Italic record | Seventh–sixth century BCE inscriptions, about 2,550–2,650 BP [S1](https://www.cambridge.org/core/books/indoeuropean-language-family/italic/473A395FABB6E9FB91AE75076F390D29) | Portuguese, Galician, Astur-Leonese, Aragonese, and wider Romance descendants | Artifact dates anchor Latin writing, not Spanish birth |
| Fijian | Proto-Oceanic | About 3,000–3,300 BP; archaeology-informed family dating [F2](https://press.anu.edu.au/downloads/press/p69411/mobile/ch03.html), [F3](https://doi.org/10.1093/jole/lzz009) | Related Fijian varieties and Polynesian through Central Pacific history | Reconstructed ancestor and calibration, not written attestation |
| Mandarin | Sino-Tibetan family root | Bayesian model means 5,871, 7,184 and 7,983 BP; 2020 95% HPD 4,778–11,285 BP [M11](https://www.nature.com/articles/s41598-020-77404-4), [M12](https://www.nature.com/articles/s41586-019-1153-z), [M13](https://pmc.ncbi.nlm.nih.gov/articles/PMC6534992/) | Sinitic branches and wider Tibetic, Burmese, Karenic and Himalayan comparisons | This estimates the wider family root, not the Sinitic split or Mandarin; model/sample/topology vary |
| Yoruba | Niger-Congo macrofamily expansion estimate; local Yoruboid stage separate | A Cambridge overview and a Language Science Press volume place Niger-Congo expansion or macrofamily depth near or above 12,000 BP, while stressing unresolved deep classification [Y3](https://academic.oup.com/edited-volume/42051/chapter/355823946), [Y13](https://doi.org/10.1017/9781107279872.018), [Y14](https://langsci-press.org/catalog/view/190/1074/1266-2) | Igala, Itsekiri, and Yoruba varieties | Broad expansion estimate is not a securely reconstructed Proto-Niger-Congo date; local model spans about 2,300–4,500 BP [Y1](https://iupress.org/9780253051486/the-yoruba/), [Y2](https://www.cambridge.org/core/books/yoruba-from-prehistory-to-the-present/geography-and-society/CC682B3D24A7A9648C018BABC1E2EDEA) |
| Hebrew | Canaanite within Northwest Semitic | Canaanite evidence c.1550–1200 BCE, about 3,150–3,500 BP [H1](https://www.cambridge.org/core/books/abs/ancient-languages-of-syriapalestine-and-arabia/hebrew/512F0FC4796BF3DB1137C1A9BA228DB1), [H2](https://sites.utexas.edu/scripts/files/2020/10/2019-AWW-The-Canaanite-Languages.pdf) | Phoenician, Ammonite, Moabite, Edomite; Aramaic as a close relative | Hebrew differentiation is gradual; the evidence dates Canaanite and early Hebrew features, not Modern Hebrew |

## Programmatic check

Every profile’s `rootEvidence.ageAssessment` stores the requested floor, a qualifying age claim, any numeric range, ancestor-stage label, qualification note and source keys. The JavaScript helper `auditRootAgeCriteria(profiles)` checks that each estimate reaches 2,500 BP, each root assessment cites registered profile sources, and each profile has at least three comparison entries. It reports uncertainty text verbatim instead of converting model estimates into an objective date. Run it directly with `node Onyx/js/language-history/research/run-invariants.js` or import it from the shared research index.

## Interpretation

The age audit is a traceability check, not a statistical reanalysis. Mandarin’s wider confidence interval and competing trees remain visible. Yoruba’s macrofamily estimate is expressly qualified because Niger-Congo’s deepest structure and reconstruction are unsettled. The audit checks whether each entry gives a sourced claim above the floor; it does not certify that competing models are equally strong.
