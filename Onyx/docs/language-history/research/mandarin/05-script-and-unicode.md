# Mandarin Chinese (Standard Mandarin focus): Script, glyph change and Unicode

**Selection:** Asian / Sinitic language.  
**Lineage:** Sino-Tibetan → Sinitic → Mandarin → Standard Mandarin.

Chinese writing has continuous use across more than three millennia, with major material and calligraphic forms including oracle-bone, bronze, seal, clerical, cursive, running and regular script. Early incised characters often have angular strokes suited to bone or metal; seal forms favor balanced, even lines; clerical writing develops prominent horizontal and descending strokes; brush-based cursive can omit or join strokes. These are histories of glyph shape and writing technique, not a single standardized stroke order for every historical object. Modern Unicode Han characters encode unified abstract ideographs; a font selects a glyph form, and regional variants can differ visibly.

The main CJK Unified Ideographs block is U+4E00–U+9FFF, with additional extension blocks; a code point such as 好 U+597D is not itself a pronunciation or a stroke-order recipe. Simplified and traditional forms coexist. Pinyin tone vowels may use precomposed letters such as ā U+0101, ǎ U+01CE and ǚ U+01DA, or base vowels plus combining marks U+0304, U+0301, U+030C and U+0300; ü is U+00FC. Pinyin is an auxiliary alphabetic system. Han script has no native subscript letters. Unicode NFC/NFD handles equivalent encoded sequences, not tone interpretation or calligraphic strokes.

## Script and encoding inventory

| Sequence | Code points | Role / reading note |
|---|---|---|
| `好` | `U+597D` | CJK Unified Ideograph; character is not an alphabetic pronunciation spelling |
| `ā` | `U+0101` | Pinyin a, first tone |
| `á` | `U+00E1` | Pinyin a, second tone |
| `ǎ` | `U+01CE` | Pinyin a, third tone |
| `à` | `U+00E0` | Pinyin a, fourth tone |
| `ē` | `U+0113` | Pinyin e, first tone |
| `ě` | `U+011B` | Pinyin e, third tone |
| `ī` | `U+012B` | Pinyin i, first tone |
| `ǐ` | `U+01D0` | Pinyin i, third tone |
| `ō` | `U+014D` | Pinyin o, first tone |
| `ǒ` | `U+01D2` | Pinyin o, third tone |
| `ū` | `U+016B` | Pinyin u, first tone |
| `ǔ` | `U+01D4` | Pinyin u, third tone |
| `ü` | `U+00FC` | Pinyin u with diaeresis |
| `ǖ` | `U+01D6` | Pinyin ü, first tone |
| `ǘ` | `U+01D8` | Pinyin ü, second tone |
| `ǚ` | `U+01DA` | Pinyin ü, third tone |
| `ǜ` | `U+01DC` | Pinyin ü, fourth tone |
| `́` | `U+0301` | combining acute, second tone |
| `̌` | `U+030C` | combining caron, third tone |
| `̀` | `U+0300` | combining grave, fourth tone |
| `̄` | `U+0304` | combining macron, first tone |
| `ǔ` | `U+0075 + U+030C` | decomposed u plus combining caron; diaeresis may add U+0308 |

### Major writing-system stages

| Stage |
|---|
| Oracle-bone inscriptions |
| Bronze inscriptions and regional Warring States forms |
| Qin small seal and Han clerical forms |
| Regular, running and cursive calligraphy |
| 1956 PRC character-simplification scheme and later standards |
| Modern traditional/simplified forms and Unicode encoding |

**Normalization:** Preserve Pinyin tone and ü distinctions. Use NFC/NFD consistently for text matching; do not strip tone marks or treat a Han character code point as its pronunciation.

**Subscript status:** No native subscript letters in Mandarin Han writing or Hanyu Pinyin. Linguistic reconstruction notation is separate.

**Glyph / stroke note:** Incision, seal cutting and brush movement produce different visible strokes. Running and cursive can join or omit strokes. The 1956 reform codified a set of simplified forms; later standards and regional practice affect which forms are in use. Unicode encodes characters, not the physical stroke sequence; glyph forms vary by font and region.

## Sources
- [M6] [Ministry of Education of the PRC, 1958 Pinyin scheme](https://www.moe.gov.cn/jyb_sjzl/ziliao/A19/195802/t19580201_186000.html)
- [M7] [Smithsonian National Museum of Asian Art, Chinese character styles](https://asia-archive.si.edu/learn/chinas-calligraphic-arts/)
- [M8] [Smithsonian, Understanding Chinese Characters](https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/lesson-plans/understanding-chinese-characters/)
- [M9] [Unicode CJK Unified Ideographs chart](https://www.unicode.org/charts/PDF/U4E00.pdf)
- [M14] [PRC Ministry of Education, State Council 1956 resolution on the Chinese Character Simplification Scheme](https://www.moe.gov.cn/jyb_xwfb/xw_fbh/moe_2128/moe_2326/moe_1144/tnull_14350.html)
- [U1] [Unicode Consortium, Characters and Combining Marks FAQ](https://www.unicode.org/faq/char_combmark.html)
- [U2] [Unicode Standard Annex #15, Normalization Forms](https://www.unicode.org/reports/tr15/)
- [U5] [Unicode Standard, Chapter 18: East Asia](https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-18/)
- [U6] [Unicode Consortium, Version 18.0.0 publication (2026-09-16)](https://www.unicode.org/versions/Unicode18.0.0/)
