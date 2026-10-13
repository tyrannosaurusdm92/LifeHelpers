# Extended language atlas

Seven profiles extend the original comparative atlas: Georgian, Khmer, Hindi, Aramaic, reconstructed Proto-Oceanic, Ancient Egyptian, and Mycenaean Greek recorded in Linear B. The last item is deliberately labeled as a language/script distinction: Linear B is not a language. Proto-Oceanic is reconstructed and has no native script.

Each profile has five linked, source-backed topic notes and six JavaScript modules (five data modules plus an index). Read [Evidence, dates, and comparison labels](evidence-methodology.md) for the distinctions between reconstructed roots, surviving records, language relationships, scripts, Unicode code points, and glyph rendering. Root-age evidence records its method, documentary status, range interpretation, source keys, and confidence; validation is separate from the original five-profile API.

| Profile | Family | Root/stage used for age test | Main caution |
|---|---|---|---|
| [Georgian (Kartuli)](georgian/README.md) | Kartvelian | Proto-Kartvelian (3,950 BP low comparative estimate; separate >12,500 BP model) | very low for exact dating; estimates are not a confidence interval |
| [Khmer (Modern Khmer; historical Old Khmer)](khmer/README.md) | Austroasiatic | Proto-Austroasiatic (3000–4500 BP) | contested model; low confidence in exact chronology and homeland |
| [Hindi (Modern Standard Hindi; Hindustani continuum)](hindi/README.md) | Indo-European | Proto-Indo-Aryan (with deeper Proto-Indo-Iranian comparison) (3200–3800 BP) | moderate for Vedic attestation horizon; lower for exact proto-stage dating |
| [Aramaic (historical language continuum)](aramaic/README.md) | Afroasiatic | Proto-Northwest Semitic → Aramaic branch (Old Aramaic attested) (2500–3500 BP) | high for early first-millennium BCE written evidence; branch boundaries and exact first dates are debated |
| [Proto-Oceanic (POc; reconstructed ancestor, not a living language)](proto-oceanic/README.md) | Austronesian | Proto-Oceanic (3000–3300 BP) | moderate as an archaeology-informed reconstruction; subgroup boundaries and dates vary |
| [Ancient Egyptian (historical stages; Afroasiatic)](egyptian/README.md) | Afroasiatic | Proto-Afroasiatic (deep reconstructed ancestor; proposals 8,000–15,000+ BP) | very low for exact deep dates and homeland; proposed dates differ by millennia |
| [Mycenaean Greek (recorded in Linear B; script/language distinguished)](linear-b-mycenaean/README.md) | Indo-European | Proto-Greek / early Greek dialect continuum (3400–4000 BP) | moderate for chronology of Greek presence and linguistic identification; exact Proto-Greek split date is modeled |

Run `node Onyx/js/language-history/research/validate-extended.js` to check extended module sources, Unicode examples, and root-age evidence.
