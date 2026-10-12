# Five language histories: expanded research set

This is the second, deeper pass on the five existing Onyx language tracks. It keeps the established selections: Spanish (Romance), Fijian (Oceanic), Mandarin Chinese (Asian / Sinitic), Yoruba (African) and Hebrew (Middle Eastern). Each language has five focused research notes and six JavaScript modules. Shared modules provide source-linked aggregation, Unicode inspection, comparison and validation.

## Browse the research

| Language | Research notes | Main comparison branches | Root-age evidence |
|---|---|---|---|
| Spanish | [Spanish notes](spanish/) | Portuguese/Galician, Astur-Leonese, Aragonese and wider Romance | Early Latin inscriptions; Spanish itself is medieval |
| Fijian | [Fijian notes](fijian/) | Fijian varieties and Polynesian through Central Pacific; Rotuman placement is cautious | Archaeology-calibrated Proto-Oceanic, about 3,000–3,300 BP |
| Mandarin | [Mandarin notes](mandarin/) | Sinitic branches and wider Sino-Tibetan comparison; subgroup labels vary | Bayesian Sino-Tibetan root estimates; Shang writing is separate and does not date Mandarin |
| Yoruba | [Yoruba notes](yoruba/) | Igala, Itsekiri and Yoruba varieties | Niger-Congo expansion estimate about 12,000 BP with contested deep classification; local Proto-Yoruboid model remains broad |
| Hebrew | [Hebrew notes](hebrew/) | Phoenician, Ammonite, Moabite and Edomite; Aramaic is a close relative | Canaanite evidence and gradual Hebrew differentiation in the Late Bronze / Early Iron transition |

## What the code contains

The JavaScript folders under `Onyx/js/language-history/research/` store family trees, chronology rows with evidence classes, scoped sound correspondences, syllable/sentence summaries and script/Unicode examples. Each record carries direct sources and caution text. The existing flat language modules remain the Onyx entry points and are extended with the research bundle. The common [index](../../../js/language-history/research/index.js) exports the five profiles; [validation](../../../js/language-history/research/validate.js) checks source coverage and Unicode examples.

## Reading dates correctly

An attested inscription dates a written object; a proto-language is reconstructed from correspondences; archaeology may calibrate a migration model; a modern spelling standard has its own institutional history. The five dates are not interchangeable. Every root-age note identifies what the date applies to and how confident the attribution is. Mandarin’s root age is a modeled Sino-Tibetan family estimate, separate from Shang writing and Mandarin; Yoruba’s deep macrofamily expansion estimate is broad and classification-sensitive, while the local Proto-Yoruboid window is explicitly model-specific.

See the [root-age criteria and model audit](root-age-criteria.md) for the 2,500-year floor, evidence types and machine-readable checks.

## Unicode and glyphs

The language files identify native letters, diacritics, tone marks, vowel points, final forms, auxiliary romanizations and code points. Unicode code points do not encode handwriting strokes or stroke order. A combining sequence can form one user-perceived grapheme; normalize text consistently, preserve language-distinctive marks, and do not treat below-base diacritics as subscript letters. See [Unicode and glyph method](unicode-and-glyph-method.md).
