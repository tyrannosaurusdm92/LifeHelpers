## Script, Unicode, diacritics, and glyphs

Modern Standard Hindi is written in Devanagari, a Brahmi-derived, left-to-right abugida with inherent vowel, dependent vowel signs, virama, and conjunct formation. Devanagari developed through northern Indian script stages including Gupta and Nāgarī; its headline, consonant bodies, and attached vowel signs are shaped by the abugida design and evolving manuscript/print hands. Braj and other prose traditions used Devanagari before the 19th-century Sanskritized Khari Boli standard; Kaithi remained important in administrative handwriting, while print and language politics increasingly privileged Devanagari Hindi. Related Urdu is normally written in a Perso-Arabic script. Script differentiation does not imply unrelated colloquial grammars.

**Unicode model:** Devanagari U+0900–U+097F, with extensions in separate blocks. Consonant + VIRAMA (U+094D) may form conjuncts; vowel signs attach to consonants and some render before the base consonant while encoded after it.

| Sample | Code points | Note |
|---|---|---|
| हिन्दी | U+0939, U+093F, U+0928, U+094D, U+0926, U+0940 | Hindi (Unicode sequence; shaping changes visual placement) |
| कि | U+0915, U+093F | KA + short-I sign; visual sign appears before consonant |
| ् | U+094D | VIRAMA / halant |
| ड़ | U+0921, U+093C | DDA + nukta |

**Subscripts:** Conjunct forms are produced by consonant sequences with virama and shaping; they are not a general inventory of subscript letters. Some conjunct glyphs are ligatures or half-forms.

**Diacritics and combining marks:** Nukta U+093C extends consonant distinctions; candrabindu U+0901 and anusvara U+0902 mark nasalization/nasal phenomena depending on word and convention. Vedic marks and transliteration diacritics need separate treatment from everyday Hindi spelling.

**Glyph strokes and layout:** Unicode stores logical character order, not the visual leftward placement of short-i matra or the stroke order of handwritten aksharas. Grapheme segmentation and font shaping follow Devanagari-specific rules.

Unicode encodes characters, not the complete historical calligraphic or palaeographic process. Record source form, normalization, transliteration, and rendering assumptions separately.

## Sources

- [D1] [Cambridge, Vedic Sanskrit and the Indo-Aryan record](https://www.cambridge.org/core/books/abs/ancient-languages-of-asia-and-the-americas/sanskrit/CF7D5B91F9736880C0CECAC672754AEB)
- [D2] [Cambridge, Hindi–Urdu–Hindustani](https://www.cambridge.org/core/books/abs/language-in-south-asia/hindiurduhindustani/5F6F26244AA8B951DEEA693790323B73)
- [D3] [Cambridge, Middle Indic (Prakrit) languages and attestations](https://www.cambridge.org/core/books/abs/ancient-languages-of-asia-and-the-americas/middle-indic/C6C74CC896F96BD1EE8F6E898D35B456)
- [D4] [W3C, Devanagari Script Resources and Layout Requirements](https://www.w3.org/TR/deva-lreq/)
- [D5] [Unicode 18, Devanagari chart](https://www.unicode.org/Public/18.0.0/charts/PDF/U0900.pdf)
- [D6] [Unicode Standard, Chapter 12 South and Central Asia](https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-12/)
- [D7] [Central Hindi Directorate, Standard Hindi orthography reference](https://chdpublication.mhrd.gov.in/)
- [D8] [Cambridge, Hindi sociolinguistic and standardization history](https://www.cambridge.org/core/books/language-in-south-asia/)
- [D9] [Cambridge, rise of Standard Hindi and early Hindi prose](https://www.cambridge.org/core/journals/journal-of-the-royal-asiatic-society/article/abs/rise-of-standard-hindi-and-early-hindi-prose-fiction/75F057672E624387018C5BA3C0161B64)
- [D10] [Cambridge, Kaithi and Devanagari in North Indian language history](https://www.cambridge.org/core/journals/modern-asian-studies/article/abs/marginalized-voice-in-the-history-of-hindi/84E174420195AFCB7F8CF347CDDDEF11)
