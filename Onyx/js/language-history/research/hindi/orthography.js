// Extended historical-linguistics dataset. Dates and reconstructions are explicitly qualified.
const record = {
  "id": "hindi",
  "language": "Hindi (Modern Standard Hindi; Hindustani continuum)",
  "kind": "script",
  "data": {
    "script": {
      "history": "Modern Standard Hindi is written in Devanagari, a Brahmi-derived, left-to-right abugida with inherent vowel, dependent vowel signs, virama, and conjunct formation. Devanagari developed through northern Indian script stages including Gupta and Nāgarī; its headline, consonant bodies, and attached vowel signs are shaped by the abugida design and evolving manuscript/print hands. Braj and other prose traditions used Devanagari before the 19th-century Sanskritized Khari Boli standard; Kaithi remained important in administrative handwriting, while print and language politics increasingly privileged Devanagari Hindi. Related Urdu is normally written in a Perso-Arabic script. Script differentiation does not imply unrelated colloquial grammars.",
      "subscripts": "Conjunct forms are produced by consonant sequences with virama and shaping; they are not a general inventory of subscript letters. Some conjunct glyphs are ligatures or half-forms.",
      "diacritics": "Nukta U+093C extends consonant distinctions; candrabindu U+0901 and anusvara U+0902 mark nasalization/nasal phenomena depending on word and convention. Vedic marks and transliteration diacritics need separate treatment from everyday Hindi spelling.",
      "strokeNotes": "Unicode stores logical character order, not the visual leftward placement of short-i matra or the stroke order of handwritten aksharas. Grapheme segmentation and font shaping follow Devanagari-specific rules.",
      "unicodeExamples": [
        {
          "text": "हिन्दी",
          "points": [
            2361,
            2367,
            2344,
            2381,
            2342,
            2368
          ],
          "note": "Hindi (Unicode sequence; shaping changes visual placement)"
        },
        {
          "text": "कि",
          "points": [
            2325,
            2367
          ],
          "note": "KA + short-I sign; visual sign appears before consonant"
        },
        {
          "text": "्",
          "points": [
            2381
          ],
          "note": "VIRAMA / halant"
        },
        {
          "text": "ड़",
          "points": [
            2337,
            2364
          ],
          "note": "DDA + nukta"
        }
      ]
    },
    "unicode": {
      "system": "Devanagari U+0900–U+097F, with extensions in separate blocks. Consonant + VIRAMA (U+094D) may form conjuncts; vowel signs attach to consonants and some render before the base consonant while encoded after it.",
      "examples": [
        [
          "हिन्दी",
          [
            2361,
            2367,
            2344,
            2381,
            2342,
            2368
          ],
          "Hindi (Unicode sequence; shaping changes visual placement)"
        ],
        [
          "कि",
          [
            2325,
            2367
          ],
          "KA + short-I sign; visual sign appears before consonant"
        ],
        [
          "्",
          [
            2381
          ],
          "VIRAMA / halant"
        ],
        [
          "ड़",
          [
            2337,
            2364
          ],
          "DDA + nukta"
        ]
      ],
      "subscripts": "Conjunct forms are produced by consonant sequences with virama and shaping; they are not a general inventory of subscript letters. Some conjunct glyphs are ligatures or half-forms.",
      "diacritics": "Nukta U+093C extends consonant distinctions; candrabindu U+0901 and anusvara U+0902 mark nasalization/nasal phenomena depending on word and convention. Vedic marks and transliteration diacritics need separate treatment from everyday Hindi spelling.",
      "stroke": "Unicode stores logical character order, not the visual leftward placement of short-i matra or the stroke order of handwritten aksharas. Grapheme segmentation and font shaping follow Devanagari-specific rules."
    }
  },
  "sources": [
    {
      "id": "D1",
      "label": "Cambridge, Vedic Sanskrit and the Indo-Aryan record",
      "url": "https://www.cambridge.org/core/books/abs/ancient-languages-of-asia-and-the-americas/sanskrit/CF7D5B91F9736880C0CECAC672754AEB"
    },
    {
      "id": "D2",
      "label": "Cambridge, Hindi–Urdu–Hindustani",
      "url": "https://www.cambridge.org/core/books/abs/language-in-south-asia/hindiurduhindustani/5F6F26244AA8B951DEEA693790323B73"
    },
    {
      "id": "D3",
      "label": "Cambridge, Middle Indic (Prakrit) languages and attestations",
      "url": "https://www.cambridge.org/core/books/abs/ancient-languages-of-asia-and-the-americas/middle-indic/C6C74CC896F96BD1EE8F6E898D35B456"
    },
    {
      "id": "D4",
      "label": "W3C, Devanagari Script Resources and Layout Requirements",
      "url": "https://www.w3.org/TR/deva-lreq/"
    },
    {
      "id": "D5",
      "label": "Unicode 18, Devanagari chart",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U0900.pdf"
    },
    {
      "id": "D6",
      "label": "Unicode Standard, Chapter 12 South and Central Asia",
      "url": "https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-12/"
    },
    {
      "id": "D7",
      "label": "Central Hindi Directorate, Standard Hindi orthography reference",
      "url": "https://chdpublication.mhrd.gov.in/"
    },
    {
      "id": "D8",
      "label": "Cambridge, Hindi sociolinguistic and standardization history",
      "url": "https://www.cambridge.org/core/books/language-in-south-asia/"
    },
    {
      "id": "D9",
      "label": "Cambridge, rise of Standard Hindi and early Hindi prose",
      "url": "https://www.cambridge.org/core/journals/journal-of-the-royal-asiatic-society/article/abs/rise-of-standard-hindi-and-early-hindi-prose-fiction/75F057672E624387018C5BA3C0161B64"
    },
    {
      "id": "D10",
      "label": "Cambridge, Kaithi and Devanagari in North Indian language history",
      "url": "https://www.cambridge.org/core/journals/modern-asian-studies/article/abs/marginalized-voice-in-the-history-of-hindi/84E174420195AFCB7F8CF347CDDDEF11"
    }
  ]
};
export default record;
