## Script, Unicode, diacritics, and glyphs

Khmer script is a Brahmi-derived abugida, transmitted through South Indian script traditions (often described via Pallava), and is historically attested in inscriptions by the early seventh century CE. Pre-Angkorian and Angkorian epigraphy shows dated regional letterform variation. Consonant series condition dependent-vowel readings; subscript consonants form clusters. In Unicode, COENG is an invisible encoding control followed by a consonant, not a standalone Khmer letter. Tie claims about individual glyph changes to inscriptional palaeography rather than assume a single unchanged model.

**Unicode model:** Khmer U+1780–U+17FF; Khmer Symbols U+19E0–U+19FF. U+17D2 KHMER SIGN COENG combines with a following consonant to form subscript-consonant sequences in shaping.

| Sample | Code points | Note |
|---|---|---|
| ភាសាខ្មែរ | U+1797, U+17B6, U+179F, U+17B6, U+1781, U+17D2, U+1798, U+17C2, U+179A | Khmer-language phrase; the coeng sequence is visible in Khmer |
| ្ | U+17D2 | COENG sign |
| ក | U+1780 | KA |
| ា | U+17B6 | AA dependent vowel sign |

**Subscripts:** In the Unicode model, U+17D2 COENG (an invisible encoding control, not a Khmer letter taught as a standalone sign) followed by a consonant encodes a subscript consonant form. Preserve code-point order and let a Khmer-capable shaping engine form the glyph.

**Diacritics and combining marks:** U+17C9 and U+17CA are Khmer register-related signs (MUUSIKATOAN and TRIISAP); vowel signs are dependent signs, and combining marks have script-specific ordering. Do not normalize away distinctions or insert generic combining marks by visual guess.

**Glyph strokes and layout:** Consonant series, inherent vowels, dependent vowels, and coeng clusters interact. Glyph placement is shaping behavior, not encoded stroke recipes; fonts and rendering engines matter.

Unicode encodes characters, not the complete historical calligraphic or palaeographic process. Record source form, normalization, transliteration, and rendering assumptions separately.

## Sources

- [K1] [Yu et al., Austroasiatic dispersal model (date is a proposal, not consensus)](https://www.nature.com/articles/s41598-017-06832-6)
- [K2] [Sidwell, Austroasiatic classification review](https://www.degruyterbrill.com/document/doi/10.1515/lingty-2018-0012/html)
- [K3] [ANU, Old Khmer Grammar (early seventh-century attestations)](https://openresearch-repository.anu.edu.au/bitstreams/ad26c181-b3e3-4776-b869-f37dd6c2a1a2/download)
- [K4] [EFEO/EPHE, Corpus of Khmer Inscriptions](https://cik.efeo.fr/)
- [K5] [Unicode 18, Khmer chart](https://www.unicode.org/Public/18.0.0/charts/PDF/U1780.pdf)
- [K6] [Unicode 18, Khmer Symbols chart](https://www.unicode.org/Public/18.0.0/charts/PDF/U19E0.pdf)
- [K7] [W3C, Khmer Script Resources and Layout Requirements](https://www.w3.org/TR/khmr-lreq/)
- [K8] [Brill, Khmer onset voicing chronology and register history](https://brill.com/downloadpdf/journals/clao/51/2/article-p175_3.pdf)
- [K9] [Unicode Standard, Chapter 16: Khmer script and coeng rendering](https://unicode.org/versions/Unicode18.0.0/core-spec/chapter-16/)
