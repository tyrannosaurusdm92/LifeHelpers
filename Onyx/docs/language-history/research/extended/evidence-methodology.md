# Evidence, dates, and comparison labels

This note explains what the seven extended profiles mean when they report an age, a root, a sibling, or a Unicode example. It prevents a reconstructed ancestor, a surviving text, a script, and a modern language from being treated as the same thing.

## How to read the dates

`BP` means years before 1950 CE. A date for a reconstructed ancestor is an inference, not an inscription date. `rangeBP` may summarize competing proposals or a model horizon; it is a confidence interval only when the cited study explicitly defines it that way. The `qualifyingAgeBP` value is the auditable value used for the minimum-age check, and the accompanying metadata states what that value dates.

Historical reconstruction and absolute dating are different operations. Comparative method can establish relative relationships and sequences of change; by itself it does not supply an absolute calendar date for a split. Absolute dates need an additional anchor, such as dated inscriptions or an explicitly described archaeological calibration. See the ANU discussion of the comparative method and absolute dating in [The Prehistory of Oceanic Languages](https://press.anu.edu.au/downloads/press/p69411/mobile/ch03.html).

## Seven profile evidence records

| Profile | Audited root value | What the value represents | Direct or documentary evidence |
|---|---:|---|---|
| Georgian | 3,950 BP | Low end of older comparative estimates for the Svan vs. Proto-Georgian-Zan split. A 2023 interdisciplinary model proposes a much older date above 12,500 BP; these are competing, method-dependent results, not a confidence interval. | Georgian inscriptions are conventionally attested from the fifth century CE. See the [2023 study and its discussion of model limitations](https://www.nature.com/articles/s41598-023-45500-w) and [Harvard's Georgian script history overview](https://daviscenter.fas.harvard.edu/research-initiatives/program-georgian-studies/cultural-highlights-georgia). |
| Khmer | 3,500 BP | Representative audit value within a contested 3,000–4,500 BP Proto-Austroasiatic model range; it is not a date for a Khmer inscription or an exact split. | Old Khmer inscriptional records are present by the early seventh century CE. See the [ANU Old Khmer grammar](https://openresearch-repository.anu.edu.au/bitstreams/ad26c181-b3e3-4776-b869-f37dd6c2a1a2/download) and [EFEO Corpus of Khmer Inscriptions](https://cik.efeo.fr/). |
| Hindi | 3,500 BP | Approximate Vedic/Indo-Aryan horizon used for the threshold audit. Proto-Indo-Aryan is reconstructed; the text-composition horizon is not a securely dated proto-language split. | The Ṛgveda is conventionally placed around 1500 BCE within a wider composition horizon, was transmitted orally, and survives in much later manuscripts. See [Cambridge's Sanskrit chapter](https://www.cambridge.org/core/books/ancient-languages-of-asia-and-the-americas/sanskrit/CF7D5B91F9736880C0CECAC672754AEB). |
| Aramaic | 2,850 BP | Documentary benchmark for early Old Aramaic, not the date of the reconstructed Proto-Northwest Semitic split. | The Tell Fakhariya inscription is generally placed in the tenth–ninth centuries BCE, with the dating qualified. See [The Cambridge History of Iran](https://www.cambridge.org/core/books/abs/cambridge-history-of-iran/aramaic-in-the-achaemenian-empire/99EF05D99F450CEB6B1A2E24815FEB13) and [Encyclopaedia Iranica](https://www.iranicaonline.org/articles/iran-vii10-aramaic/). |
| Proto-Oceanic | 3,200 BP | Archaeology-informed estimate for a reconstructed speech-community horizon. This is not a written attestation or a date produced by comparative method alone. | No contemporary Proto-Oceanic text or known native writing system exists; the language is reconstructed from descendants. See [ANU's current view of Oceanic prehistory](https://press.anu.edu.au/downloads/press/p69411/mobile/ch03.html) and [the Proto Oceanic lexicon's reconstruction method](https://tlopo.clld.org/contributions/5-1). |
| Ancient Egyptian | 8,000 BP | Younger edge of cited Proto-Afroasiatic chronology proposals. Published proposals extend from roughly 8,000–10,000 BP to 15,000 BP or older; no single date is consensus. | Egyptian is a later-attested daughter branch; Egyptian writing appears in the late fourth millennium BCE. See [Chicago's Egyptian chronology and script overview](https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/oimp32.pdf) and the chronology discussion in [the Afroasiatic review](https://doi.org/10.4000/bmsap.564). |
| Mycenaean Greek / Linear B | 3,600 BP | Model-based Proto-Greek/early Greek horizon. It is separate from the date of extant Linear B tablets. | Mycenaean Greek documents in Linear B date mainly to about 1450–1150 BCE. The corpus notes that the tablets are mostly administrative and that Linear B underspecifies Greek phonology. See [DĀMOS](https://damos.hf.uio.no/about/content/) and [Unicode Standard, Chapter 8](https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-8/). |

The values are therefore not seven equivalent kinds of “oldest record.” The `documentation` field in each JavaScript profile records that distinction as `epigraphic`, `oral-tradition`, or `none-known`, and stores separate source keys for that evidence.

## Language relationships are not script relationships

The `siblings` arrays are comparison sets and may mix close relatives, distant family members, dialect groups, or standardized registers. Each lineage note explains which relation applies. They should not be read as a claim that every listed item is an immediate sister branch.

Linear B is a writing system used to record Mycenaean Greek. Linear A is an earlier Aegean script whose language remains undeciphered; it is a script comparison, not a Greek language sibling. The profile stores that distinction under `relatedScripts` and keeps the language comparison set Greek-only.

Proto-Oceanic has no known native script. Its `*patu`, `ŋ`, `ā`, and `ʔ` samples are modern scholarly transcription characters, not recovered ancient glyphs.

## Unicode, glyphs, and writing practice

Unicode code points identify encoded characters. They do not specify the historical shape, pen or chisel strokes, stroke order, ductus, or manuscript allograph. Rendering may form a glyph from several code points or choose a contextual shape. For example, the Unicode Standard describes Khmer U+17D2 COENG as an invisible encoding component followed by a consonant in subscript sequences, and explains contextual glyph alternation in [Chapter 16](https://unicode.org/versions/Unicode18.0.0/core-spec/chapter-16/). It is not a standalone letter.

The validator checks that each listed sample reproduces its stated code points and that code points fall inside the documented Unicode script blocks. Proto-Oceanic is exempt from native-script block checks because its examples are explicitly transcription. These checks verify encoding metadata; they do not replace palaeographic review of dated artifacts.
