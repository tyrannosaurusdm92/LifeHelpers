# Yoruba (standard orthography; dialect continuum): Script, glyph change and Unicode

**Selection:** African language.  
**Lineage:** Niger-Congo (classification contested at highest levels) → Volta-Niger / Benue-Congo groupings vary → Yoruboid → Edekiri / Yoruba varieties.

Yoruba is written primarily in an adapted Latin alphabet. Standard letters Ẹ/ẹ, Ọ/ọ and Ṣ/ṣ distinguish sounds; tone marks above vowels and syllabic nasals indicate high (acute) and low (grave), while mid tone is often unmarked or shown with a macron for disambiguation. The underdot is a below-base diacritic that identifies a different letter value; it is not a subscript letter. A tone mark and an underdot can occur on the same vowel, so rendering needs a font with correct stacking. Some communities have used Arabic Ajami, but there is no single uniform Ajami standard for all Yoruba text.

Unicode examples include Ẹ U+1EB8, ẹ U+1EB9, Ọ U+1ECC, ọ U+1ECD, Ṣ U+1E62 and ṣ U+1E63. An acute can be U+0301 and grave U+0300; underdots can be represented in sequences with U+0323, although precomposed underdotted letters are also available. For example, e + dot below + acute can normalize to ẹ + acute. NFC/NFD may therefore produce different code-point sequences that render as the same grapheme. A 2026 preprint describes normalization failures in more than 60% of lines in a 24,905-sentence tone-marked corpus. A separate 2026 preprint proposes caron/circumflex as optional contour-tone marks; these are not standard orthography. Preserve underdots and tone marks in canonical text; do not strip accents for search storage. The writing system has no native subscript letters. Unicode encodes marks and abstract characters, not the hand strokes of manuscript or print glyphs.

## Script and encoding inventory

| Sequence | Code points | Role / reading note |
|---|---|---|
| `Ẹ` | `U+1EB8` | capital E with dot below |
| `ẹ` | `U+1EB9` | small e with dot below |
| `Ṣ` | `U+1E62` | capital S with dot below |
| `ṣ` | `U+1E63` | small s with dot below |
| `ẹ́` | `U+1EB9 + U+0301` | precomposed underdotted e plus combining acute |
| `ẹ́` | `U+0065 + U+0323 + U+0301` | decomposed base, dot below, acute; normalize carefully |
| `ń` | `U+0144` | small n with acute; high tone on a syllabic nasal |
| `ǹ` | `U+01F9` | small n with grave; low tone on a syllabic nasal |
| `n̄` | `U+006E + U+0304` | n plus combining macron; mid tone may be marked to disambiguate |
| `ǎ` | `U+0061 + U+030C` | base a plus combining caron, shown only as a proposed contour-tone notation |

### Major writing-system stages

| Stage |
|---|
| Pre-standard oral and manuscript traditions |
| 19th-century missionary Latin literacy |
| Orthography standardization in 1875-era and later work |
| 1974 standard and ongoing digital/educational conventions |
| 2026 digital corpus and proposed contour-tone notation |

**Normalization:** Support both precomposed and combining sequences; NFC is convenient, but compare normalized grapheme sequences. Never drop underdots or tone marks from canonical Yoruba text.

**Subscript status:** Underdots are combining diacritics, not subscript letters. No native subscript letters in standard Yoruba orthography.

**Glyph / stroke note:** Underdots and stacked tone marks change the letter/grapheme distinction. Handwritten dots, printed marks and font placement vary; Unicode records code points and combining behavior, not physical stroke order. A 2026 proposal uses caron/circumflex for contour tones, but that is not the 1974 standard.

## Sources
- [Y5] [Yoruba tone-mark restoration study](https://journals.agh.edu.pl/csci/article/view/2128)
- [Y7] [Yoruba Writing: Standards and Trends](https://www.theartsjournal.org/index.php/site/article/view/50)
- [Y9] [Oxford Scholarship Online, Yoruba orthography and the 1974 standard](https://academic.oup.com/princeton-scholarship-online/book/60415/chapter-abstract/520979142)
- [Y10] [Tubosun, Marking Contour Tones in Yorùbá (2026 preprint)](https://arxiv.org/abs/2609.38627)
- [Y11] [Tubosun et al., ÌròyìnSpeech tone-marked Yorùbá corpus and normalization (2026 preprint)](https://arxiv.org/abs/2610.05366)
- [U1] [Unicode Consortium, Characters and Combining Marks FAQ](https://www.unicode.org/faq/char_combmark.html)
- [U2] [Unicode Standard Annex #15, Normalization Forms](https://www.unicode.org/reports/tr15/)
- [U3] [Unicode Latin Extended Additional chart](https://www.unicode.org/charts/PDF/U1E00.pdf)
