# Hebrew (Biblical through Modern): Script, glyph change and Unicode

**Selection:** Middle Eastern language.  
**Lineage:** Afro-Asiatic → Semitic → West Semitic → Central Semitic → Northwest Semitic → Canaanite → Hebrew.

Hebrew script evolved from Phoenician-derived Paleo-Hebrew into the Aramaic-derived square script now used for Hebrew. The transition was gradual, not a one-time alphabet replacement; Paleo-Hebrew remained in some Second Temple settings. The consonantal alphabet has 22 core letters and five final-form variants for letters at word end. Matres lectionis provide some vowel cues, and Masoretic niqqud and cantillation marks were added later to represent a reading tradition. Modern prose is usually unpointed. Hebrew is written right-to-left; Unicode stores text in logical order and a bidi algorithm determines visual display.

The Hebrew block spans U+0590–U+05FF. Examples include bet ב U+05D1, final kaf ך U+05DA, sheva U+05B0, qamats U+05B8, dagesh U+05BC and shin dot U+05C1. Niqqud are combining points placed around a consonant; their position below a letter does not make them subscript letters. Fonts and traditions can vary in the visual placement and shape of points. Unicode code points do not store the stroke order, brush/pen movement or a manuscript allograph. Store Hebrew in logical RTL order, preserve marks when present, and test cursor, selection, punctuation and normalization behavior in mixed-direction text.

## Script and encoding inventory

| Sequence | Code points | Role / reading note |
|---|---|---|
| `ב` | `U+05D1` | bet |
| `ך` | `U+05DA` | final kaf, separate code point |
| `ְ` | `U+05B0` | sheva niqqud combining point |
| `ָ` | `U+05B8` | qamats niqqud combining point |
| `שׁ` | `U+05E9 + U+05C1` | shin with combining shin dot |

### Major writing-system stages

| Stage |
|---|
| Proto-Canaanite / Phoenician alphabet traditions |
| Paleo-Hebrew in Iron Age contexts |
| Gradual adoption of Aramaic-derived square script in Persian period |
| Masoretic niqqud and cantillation in manuscript reading traditions |
| Modern mostly unpointed Hebrew in RTL digital text |

**Normalization:** Keep logical RTL character order and combining marks. NFC/NFD may change code-point sequences; test mixed-direction punctuation and selection. Do not remove niqqud from pointed source text.

**Subscript status:** Niqqud can appear below a consonant but are combining vowel points, not subscript letters; Hebrew has no native subscript letters.

**Glyph / stroke note:** Paleo-Hebrew and square letters have distinct historical strokes and shapes. Vowel points are later combining signs around consonants; final forms are separate letters. Unicode encodes text and combining marks, not handwriting paths.

## Sources
- [H3] [Mnamon, Hebrew writing systems](https://mnamon.sns.it/index.php?id=8&lang=en&page=Scrittura)
- [H4] [Bar-Ilan University, Paleo-Hebrew script history](https://cris.biu.ac.il/ws/portalfiles/portal/55985668/3511_Article_Text_15900_1_10_20171121.pdf)
- [U1] [Unicode Consortium, Characters and Combining Marks FAQ](https://www.unicode.org/faq/char_combmark.html)
- [U2] [Unicode Standard Annex #15, Normalization Forms](https://www.unicode.org/reports/tr15/)
- [U4] [Unicode Hebrew chart](https://www.unicode.org/charts/PDF/U0590.pdf)
