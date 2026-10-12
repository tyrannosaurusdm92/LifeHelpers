# Unicode, diacritics, glyphs and strokes

Unicode encodes abstract characters and combining marks. A user-perceived grapheme can consist of several code points: Spanish `n` + COMBINING TILDE can render as `ñ`; Yoruba `e` + DOT BELOW + ACUTE can render as `ẹ́`; Hebrew vowel points combine with a consonant; Pinyin can use precomposed tone vowels or decomposed base-plus-mark sequences. Unicode’s FAQ distinguishes a code point from an end-user grapheme and explains that a combining mark’s linguistic function is language-specific.

## Normalization

NFC and NFD are canonical representations of equivalent text. They can have different code-point sequences. The JavaScript utility reports code points before and after normalization; it does not remove accents or decide whether a spelling is correct. Normalize at system boundaries and preserve the source form when doing philological work. A 2026 Yorùbá speech-corpus preprint reports normalization inconsistencies in over 60% of its 24,905 sentence lines. That is a corpus-preparation result, not a measured rate for all Yorùbá digital text; it illustrates why tone and underdot sequences need explicit testing.

The same year, a preprint proposed using caron and circumflex for certain Yorùbá contour tones. These are existing Unicode marks, but the proposal does not make them part of standard Yorùbá spelling. Data pipelines should preserve the marks and attach orthographic status as metadata instead of silently rewriting text.

## Below-base marks and subscripts

Yoruba underdots and Hebrew niqqud may appear below a base letter, but they are combining diacritics or points, not subscript letters. The standard orthographies in this set have no native subscript letters. Linguists use subscript-like notation in IPA, phonetic narrow transcription or reconstructed notation; keep that in a separate annotation layer.

## Strokes and historical glyphs

The Chinese writing-system notes describe changes in material and brush practice: incision on bone, bronze inscription, seal forms, clerical brush strokes, and running/cursive joining or omission. Latin and Hebrew notes compare major script traditions and changing letter shapes. Fijian and Yoruba show how existing Latin glyphs gained language-specific values and marks. No Unicode string stores the historical pen path, order, pressure, carving motion or allograph. To preserve stroke-level history, a project needs separate paleographic image/vector data with provenance.

## Sources

- [Unicode Characters and Combining Marks FAQ](https://www.unicode.org/faq/char_combmark.html)
- [Unicode Standard Annex #15: Normalization Forms](https://www.unicode.org/reports/tr15/)
- [Unicode Standard, Chapter 18: East Asia](https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-18/)
- [Unicode 18.0.0 publication, September 16, 2026](https://www.unicode.org/versions/Unicode18.0.0/)
- [Smithsonian, China’s Calligraphic Arts](https://asia-archive.si.edu/learn/chinas-calligraphic-arts/)
- [Tubosun et al., ÌròyìnSpeech tone-marked Yorùbá corpus (2026 preprint)](https://arxiv.org/abs/2610.05366)
- [Tubosun, contour tones in Yorùbá (2026 preprint)](https://arxiv.org/abs/2609.38627)
