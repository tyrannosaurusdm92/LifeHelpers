// Extended historical-linguistics dataset. Dates and reconstructions are explicitly qualified.
const record = {
  "id": "georgian",
  "language": "Georgian (Kartuli)",
  "kind": "script",
  "data": {
    "script": {
      "history": "Three Georgian scripts are historically recognized: Asomtavruli/Mrgvlovani, Nuskhuri, and Mkhedruli. Asomtavruli is the monumental/majuscule form; Nuskhuri is the more compact ecclesiastical minuscule, used with Asomtavruli in Khutsuri; Mkhedruli became the everyday civil hand and predominates today. Modern Mtavruli uppercase forms have separate Unicode encoding. Fifth-century inscriptions provide secure early evidence; claims of a pre-Christian alphabet remain disputed. Georgian scripts are historical systems, not merely font styles.",
      "subscripts": "Georgian alphabetic spelling has no productive subscript-letter system.",
      "diacritics": "Modern standard spelling usually does not mark stress or tone with diacritics. Scholarly transliteration may use macrons, dots, or apostrophes; those belong to a declared transcription convention, not to ordinary Georgian Unicode spelling.",
      "strokeNotes": "Unicode scalar values identify characters; stroke order and regional glyph design are paleographic/font matters. Mkhedruli and Mtavruli have corresponding code points where encoded, while shaping and font support affect appearance.",
      "unicodeExamples": [
        {
          "text": "ა",
          "points": [
            4304
          ],
          "note": "Mkhedruli a"
        },
        {
          "text": "Ⴀ",
          "points": [
            4256
          ],
          "note": "Asomtavruli an"
        },
        {
          "text": "ⴀ",
          "points": [
            11520
          ],
          "note": "Nuskhuri an"
        },
        {
          "text": "Ა",
          "points": [
            7312
          ],
          "note": "Mtavruli an"
        }
      ]
    },
    "unicode": {
      "system": "Georgian script encoding across Georgian U+10A0–U+10FF, Georgian Supplement U+2D00–U+2D2F, and Georgian Extended U+1C90–U+1CBF. Unicode encodes characters, not historical pen strokes or mandatory letterforms.",
      "examples": [
        [
          "ა",
          [
            4304
          ],
          "Mkhedruli a"
        ],
        [
          "Ⴀ",
          [
            4256
          ],
          "Asomtavruli an"
        ],
        [
          "ⴀ",
          [
            11520
          ],
          "Nuskhuri an"
        ],
        [
          "Ა",
          [
            7312
          ],
          "Mtavruli an"
        ]
      ],
      "subscripts": "Georgian alphabetic spelling has no productive subscript-letter system.",
      "diacritics": "Modern standard spelling usually does not mark stress or tone with diacritics. Scholarly transliteration may use macrons, dots, or apostrophes; those belong to a declared transcription convention, not to ordinary Georgian Unicode spelling.",
      "stroke": "Unicode scalar values identify characters; stroke order and regional glyph design are paleographic/font matters. Mkhedruli and Mtavruli have corresponding code points where encoded, while shaping and font support affect appearance."
    }
  },
  "sources": [
    {
      "id": "G1",
      "label": "Cambridge, Early Georgian and Kartvelian classification",
      "url": "https://www.cambridge.org/core/books/abs/ancient-languages-of-asia-minor/early-georgian/77E0BDB0644538696593D7D3B1500E7E"
    },
    {
      "id": "G2",
      "label": "Scientific Reports, Proto-Kartvelian dating model (hypothesis; interpret cautiously)",
      "url": "https://www.nature.com/articles/s41598-023-45500-w"
    },
    {
      "id": "G3",
      "label": "UNESCO, Georgian alphabet and three writing systems",
      "url": "https://ich.unesco.org/en/RL/living-culture-of-three-writing-systems-of-the-georgian-alphabet-01205"
    },
    {
      "id": "G4",
      "label": "Unicode 18, Georgian block",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U10A0.pdf"
    },
    {
      "id": "G5",
      "label": "Unicode 18, Georgian Extended",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U1C90.pdf"
    },
    {
      "id": "G6",
      "label": "Unicode 18, Georgian Supplement",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U2D00.pdf"
    },
    {
      "id": "G7",
      "label": "Georgian National Archives",
      "url": "https://archive.gov.ge/en"
    },
    {
      "id": "G8",
      "label": "Cambridge, Kartvelian language classification and structure",
      "url": "https://www.cambridge.org/core/books/abs/companion-to-endangered-languages/kartvelian-languages/9D54CB9A31F0C83CF67B934BAC1843A9"
    },
    {
      "id": "G9",
      "label": "Harvard Davis Center, Georgian script history and fifth-century inscriptions",
      "url": "https://daviscenter.fas.harvard.edu/research-initiatives/program-georgian-studies/cultural-highlights-georgia"
    }
  ]
};
export default record;
