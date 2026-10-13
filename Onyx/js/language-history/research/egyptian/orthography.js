// Extended historical-linguistics dataset. Dates and reconstructions are explicitly qualified.
const record = {
  "id": "egyptian",
  "language": "Ancient Egyptian (historical stages; Afroasiatic)",
  "kind": "script",
  "data": {
    "script": {
      "history": "Egyptian language used successive and partly overlapping scripts: monumental hieroglyphs, cursive hieratic, later Demotic, and Coptic. Hieratic is a cursive hieroglyphic hand; Demotic developed as an increasingly cursive administrative/literary script; Coptic uses Greek letters plus signs derived from Demotic for Egyptian sounds absent from Greek. Sign shapes, orientation toward people/animals, and group placement in quadrats vary with medium and period. Unicode logical order and layout controls are not a facsimile of the historical writing surface.",
      "subscripts": "Egyptological transliteration uses underdots, macrons, and sometimes subscript numerals in editorial conventions (e.g. phoneme distinctions); these are not hieroglyphic signs. No generalized hieroglyph subscript-letter alphabet exists.",
      "diacritics": "Scholarly transliteration uses characters such as ꜣ, ꜥ, ḥ, ḫ, and ṯ, while Unicode also provides combining diacritics. Preserve the edition’s transliteration standards and do not infer ancient vowels from inserted marks.",
      "strokeNotes": "Sign placement and orientation obey quadrat/layout conventions. Unicode format-control characters can indicate joining and grouping, but renderers vary; they do not encode brush stroke order or replace a sign-list reference such as Gardiner classification.",
      "unicodeExamples": [
        {
          "text": "𓀀",
          "points": [
            77824
          ],
          "note": "Egyptian Hieroglyph A001; Unicode scalar U+13000"
        },
        {
          "text": "𓀁",
          "points": [
            77825
          ],
          "note": "Egyptian Hieroglyph A002"
        },
        {
          "text": "𓐷",
          "points": [
            78903
          ],
          "note": "Egyptian Hieroglyph Vertical Joiner"
        },
        {
          "text": "𓐸",
          "points": [
            78904
          ],
          "note": "Egyptian Hieroglyph Horizontal Joiner"
        }
      ]
    },
    "unicode": {
      "system": "Egyptian Hieroglyphs U+13000–U+1342F; Egyptian Hieroglyph Format Controls U+13430–U+1345F; Egyptian Hieroglyphs Extended-A U+13460–U+143FF. Unicode encodes signs and controls for grouping/formatting, not a complete facsimile of manuscript layout.",
      "examples": [
        [
          "𓀀",
          [
            77824
          ],
          "Egyptian Hieroglyph A001; Unicode scalar U+13000"
        ],
        [
          "𓀁",
          [
            77825
          ],
          "Egyptian Hieroglyph A002"
        ],
        [
          "𓐷",
          [
            78903
          ],
          "Egyptian Hieroglyph Vertical Joiner"
        ],
        [
          "𓐸",
          [
            78904
          ],
          "Egyptian Hieroglyph Horizontal Joiner"
        ]
      ],
      "subscripts": "Egyptological transliteration uses underdots, macrons, and sometimes subscript numerals in editorial conventions (e.g. phoneme distinctions); these are not hieroglyphic signs. No generalized hieroglyph subscript-letter alphabet exists.",
      "diacritics": "Scholarly transliteration uses characters such as ꜣ, ꜥ, ḥ, ḫ, and ṯ, while Unicode also provides combining diacritics. Preserve the edition’s transliteration standards and do not infer ancient vowels from inserted marks.",
      "stroke": "Sign placement and orientation obey quadrat/layout conventions. Unicode format-control characters can indicate joining and grouping, but renderers vary; they do not encode brush stroke order or replace a sign-list reference such as Gardiner classification."
    }
  },
  "sources": [
    {
      "id": "E1",
      "label": "University of Chicago, Ancient Egyptian Language Program: five stages and chronology",
      "url": "https://mes.uchicago.edu/languages/ancient-egyptian-language-program"
    },
    {
      "id": "E2",
      "label": "Cambridge, Ancient Egyptian as an autonomous Afroasiatic branch",
      "url": "https://www.cambridge.org/core/books/abs/ancient-egyptian/language-of-ancient-egypt/83FF2825CC9D595A421DDBE46A35EE47"
    },
    {
      "id": "E3",
      "label": "University of Chicago, Old Egyptian course/stage",
      "url": "https://mes.uchicago.edu/taxonomy/term/99"
    },
    {
      "id": "E4",
      "label": "University of Chicago, Egyptian language chronology and scripts",
      "url": "https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/oimp32.pdf"
    },
    {
      "id": "E5",
      "label": "Unicode 18, Egyptian Hieroglyphs chart",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U13000.pdf"
    },
    {
      "id": "E6",
      "label": "Unicode 18, Egyptian Hieroglyph Format Controls",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U13430.pdf"
    },
    {
      "id": "E7",
      "label": "Unicode Standard, Chapter 11 African and West Asian scripts",
      "url": "https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-11/"
    },
    {
      "id": "E8",
      "label": "Cambridge, Egyptian phonology and limits of historical reconstruction",
      "url": "https://www.cambridge.org/core/books/abs/ancient-egyptian/egyptian-phonology/23B7D5888A4B35A64377E8FE62B8F9EF"
    },
    {
      "id": "E9",
      "label": "Blažek, Origins and expansion of Afro-Asiatic: chronology proposals and methodological cautions",
      "url": "https://doi.org/10.4000/bmsap.564"
    },
    {
      "id": "E10",
      "label": "Glottolog bibliography, Militarev, Towards the chronology of Afrasian and daughter families",
      "url": "https://glottolog.org/resource/reference/id/144297"
    }
  ]
};
export default record;
