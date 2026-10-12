# Spanish: Script, glyph change and Unicode

**Selection:** Romance language.  
**Lineage:** Indo-European → Italic → Latin → Romance → Ibero-Romance → Castilian / Spanish.

Spanish uses the Latin alphabet, whose Roman forms developed through earlier Greek and Etruscan writing traditions and later changed through monumental capitals, cursive hands, medieval book scripts, printing and modern type. These are changes in glyph design and writing practice; Unicode encodes abstract text characters, not the pen path, pressure, stroke order or historical allograph. In medieval manuscripts, a small superscript n used as an abbreviation for a doubled n contributed to the development of ñ. Modern Spanish treats ñ as a separate alphabet letter, whereas ch and ll are digraphs. Acute accents mark stress or contrasts according to spelling rules; ü indicates that u is pronounced in güe/güi. The inverted question and exclamation marks are punctuation.

Useful encodings include ñ U+00F1 (or n U+006E plus U+0303 in decomposed text), á U+00E1, ü U+00FC, ¿ U+00BF and ¡ U+00A1. NFC may store common accented letters as precomposed code points; NFD may represent them with a base letter and combining mark. Both can render the same grapheme. Spanish has no native subscript letters. A diaeresis, acute accent and tilde are not interchangeable marks: their linguistic function depends on the orthography, even where Unicode uses shared combining characters.

## Script and encoding inventory

| Sequence | Code points | Role / reading note |
|---|---|---|
| `ñ` | `U+00F1` | Spanish letter eñe; NFC example |
| `ñ` | `U+006E + U+0303` | NFD sequence rendering the same grapheme |
| `á` | `U+00E1` | acute-accented a |
| `é` | `U+00E9` | acute-accented e |
| `í` | `U+00ED` | acute-accented i |
| `ó` | `U+00F3` | acute-accented o |
| `ú` | `U+00FA` | acute-accented u |
| `ü` | `U+00FC` | u with diaeresis in güe/güi |
| `¿` | `U+00BF` | inverted question mark |
| `¡` | `U+00A1` | inverted exclamation mark |
| `́` | `U+0301` | combining acute accent in decomposed text |
| `̃` | `U+0303` | combining tilde in decomposed ñ |

### Major writing-system stages

| Stage |
|---|
| Roman capitals and cursive traditions |
| Late antique and medieval book/cursive scripts |
| Printing and early modern codification |
| Modern Spanish alphabet and punctuation |

**Normalization:** Preserve accents, ñ, ü and punctuation. Normalize at a system boundary, usually NFC for storage/display interoperability; never strip marks from canonical text.

**Subscript status:** No native subscript letters in the standard orthography. Linguistic subscripts in IPA or metadata belong to a separate notation layer.

**Glyph / stroke note:** Letterforms and writing tools change the visible stroke shape; the ñ tilde descends from an abbreviation mark over n in medieval practice. Unicode stores text values, not handwriting trajectories.

## Sources
- [S5] [RAE-ASALE, Diccionario panhispánico de dudas: u and diéresis](https://www.rae.es/dpd/u)
- [S6] [Cambridge, Latin Script in Antiquity](https://www.cambridge.org/core/books/abs/latin-palaeography/latin-script-in-antiquity/7AAE013BCD262AB689DE4B2FAAD02B0D)
- [S7] [FundéuRAE, medieval origin of ñ](https://www.fundeu.es/noticia/cual-es-el-origen-de-la-letra-n-y-que-otras-lenguas-la-utilizan/)
- [U1] [Unicode Consortium, Characters and Combining Marks FAQ](https://www.unicode.org/faq/char_combmark.html)
- [U2] [Unicode Standard Annex #15, Normalization Forms](https://www.unicode.org/reports/tr15/)
