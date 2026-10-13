// Extended historical-linguistics dataset. Dates and reconstructions are explicitly qualified.
const record = {
  "id": "khmer",
  "language": "Khmer (Modern Khmer; historical Old Khmer)",
  "kind": "script",
  "data": {
    "script": {
      "history": "Khmer script is a Brahmi-derived abugida, transmitted through South Indian script traditions (often described via Pallava), and is historically attested in inscriptions by the early seventh century CE. Pre-Angkorian and Angkorian epigraphy shows dated regional letterform variation. Consonant series condition dependent-vowel readings; subscript consonants form clusters. In Unicode, COENG is an invisible encoding control followed by a consonant, not a standalone Khmer letter. Tie claims about individual glyph changes to inscriptional palaeography rather than assume a single unchanged model.",
      "subscripts": "In the Unicode model, U+17D2 COENG (an invisible encoding control, not a Khmer letter taught as a standalone sign) followed by a consonant encodes a subscript consonant form. Preserve code-point order and let a Khmer-capable shaping engine form the glyph.",
      "diacritics": "U+17C9 and U+17CA are Khmer register-related signs (MUUSIKATOAN and TRIISAP); vowel signs are dependent signs, and combining marks have script-specific ordering. Do not normalize away distinctions or insert generic combining marks by visual guess.",
      "strokeNotes": "Consonant series, inherent vowels, dependent vowels, and coeng clusters interact. Glyph placement is shaping behavior, not encoded stroke recipes; fonts and rendering engines matter.",
      "unicodeExamples": [
        {
          "text": "ភាសាខ្មែរ",
          "points": [
            6039,
            6070,
            6047,
            6070,
            6017,
            6098,
            6040,
            6082,
            6042
          ],
          "note": "Khmer-language phrase; the coeng sequence is visible in Khmer"
        },
        {
          "text": "្",
          "points": [
            6098
          ],
          "note": "COENG sign"
        },
        {
          "text": "ក",
          "points": [
            6016
          ],
          "note": "KA"
        },
        {
          "text": "ា",
          "points": [
            6070
          ],
          "note": "AA dependent vowel sign"
        }
      ]
    },
    "unicode": {
      "system": "Khmer U+1780–U+17FF; Khmer Symbols U+19E0–U+19FF. U+17D2 KHMER SIGN COENG combines with a following consonant to form subscript-consonant sequences in shaping.",
      "examples": [
        [
          "ភាសាខ្មែរ",
          [
            6039,
            6070,
            6047,
            6070,
            6017,
            6098,
            6040,
            6082,
            6042
          ],
          "Khmer-language phrase; the coeng sequence is visible in Khmer"
        ],
        [
          "្",
          [
            6098
          ],
          "COENG sign"
        ],
        [
          "ក",
          [
            6016
          ],
          "KA"
        ],
        [
          "ា",
          [
            6070
          ],
          "AA dependent vowel sign"
        ]
      ],
      "subscripts": "In the Unicode model, U+17D2 COENG (an invisible encoding control, not a Khmer letter taught as a standalone sign) followed by a consonant encodes a subscript consonant form. Preserve code-point order and let a Khmer-capable shaping engine form the glyph.",
      "diacritics": "U+17C9 and U+17CA are Khmer register-related signs (MUUSIKATOAN and TRIISAP); vowel signs are dependent signs, and combining marks have script-specific ordering. Do not normalize away distinctions or insert generic combining marks by visual guess.",
      "stroke": "Consonant series, inherent vowels, dependent vowels, and coeng clusters interact. Glyph placement is shaping behavior, not encoded stroke recipes; fonts and rendering engines matter."
    }
  },
  "sources": [
    {
      "id": "K1",
      "label": "Yu et al., Austroasiatic dispersal model (date is a proposal, not consensus)",
      "url": "https://www.nature.com/articles/s41598-017-06832-6"
    },
    {
      "id": "K2",
      "label": "Sidwell, Austroasiatic classification review",
      "url": "https://www.degruyterbrill.com/document/doi/10.1515/lingty-2018-0012/html"
    },
    {
      "id": "K3",
      "label": "ANU, Old Khmer Grammar (early seventh-century attestations)",
      "url": "https://openresearch-repository.anu.edu.au/bitstreams/ad26c181-b3e3-4776-b869-f37dd6c2a1a2/download"
    },
    {
      "id": "K4",
      "label": "EFEO/EPHE, Corpus of Khmer Inscriptions",
      "url": "https://cik.efeo.fr/"
    },
    {
      "id": "K5",
      "label": "Unicode 18, Khmer chart",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U1780.pdf"
    },
    {
      "id": "K6",
      "label": "Unicode 18, Khmer Symbols chart",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U19E0.pdf"
    },
    {
      "id": "K7",
      "label": "W3C, Khmer Script Resources and Layout Requirements",
      "url": "https://www.w3.org/TR/khmr-lreq/"
    },
    {
      "id": "K8",
      "label": "Brill, Khmer onset voicing chronology and register history",
      "url": "https://brill.com/downloadpdf/journals/clao/51/2/article-p175_3.pdf"
    },
    {
      "id": "K9",
      "label": "Unicode Standard, Chapter 16: Khmer script and coeng rendering",
      "url": "https://unicode.org/versions/Unicode18.0.0/core-spec/chapter-16/"
    }
  ]
};
export default record;
