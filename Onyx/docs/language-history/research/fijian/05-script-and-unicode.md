# Fijian (standard, Bauan-influenced): Script, glyph change and Unicode

**Selection:** Oceanic language.  
**Lineage:** Austronesian → Malayo-Polynesian → Oceanic → Central Pacific → Fijian varieties → Standard Fijian.

The standard Fijian writing system is Latin-based and was shaped by 19th-century missionary spelling and printing, with Bauan influence. Its design is economical: b, d and q encode prenasalized stops, g encodes the velar nasal, c the voiced interdental fricative, and dr is conventionally written with two Latin letters for a special consonant. The odd-looking values are stable parts of the orthography, not typographical mistakes. Fijian does not have a separate ancient indigenous alphabet that this modern Latin spelling replaced; written history must be distinguished from the much older oral language.

Core spellings use basic Latin Unicode code points. The standard orthography generally does not mark tone or vowel length with required diacritics. Scholarly macrons, IPA brackets and proto-language asterisks are notation layers, not standard Fijian letters. Historical printed type and handwriting can vary in stroke design, but Unicode stores letters and not their pen paths or stroke order. The standard orthography has no native subscript letters. Preserve macrons in cited linguistic transcription rather than deleting them or silently treating them as standard spelling.

## Script and encoding inventory

| Sequence | Code points | Role / reading note |
|---|---|---|
| `b` | `U+0062` | standard Fijian grapheme commonly /mb/ |
| `d` | `U+0064` | standard Fijian grapheme commonly /nd/ |
| `q` | `U+0071` | standard Fijian grapheme commonly /ŋg/ |
| `c` | `U+0063` | standard Fijian grapheme /ð/ |
| `dr` | `U+0064 + U+0072` | two code points; one special orthographic sequence |

### Major writing-system stages

| Stage |
|---|
| Oral transmission and regional varieties |
| Early explorer/missionary spellings |
| Late 1830s printing and scripture translation |
| Standard written Fijian with stable letter values |

**Normalization:** Use NFC for ordinary storage. Keep standard spelling distinct from IPA and scholarly macron conventions; do not remove marks from cited transcriptions.

**Subscript status:** No native subscript letters in standard Fijian spelling.

**Glyph / stroke note:** Letter values were chosen within Latin type and printing constraints. The printed glyph is not a phonetic description: b/d/q encode prenasalized sounds; c/g have non-English values. Unicode does not encode stroke order.

## Sources
- [F4] [Albert J. Schütz, The Fijian Language, University of Hawai‘i Press](https://manifold.uhpress.hawaii.edu/projects/the-fijian-language)
- [F6] [Cambridge Museum of Archaeology and Anthropology, Fiji missionaries](https://maa.cam.ac.uk/Fiji-missionaries)
- [U1] [Unicode Consortium, Characters and Combining Marks FAQ](https://www.unicode.org/faq/char_combmark.html)
- [U2] [Unicode Standard Annex #15, Normalization Forms](https://www.unicode.org/reports/tr15/)
