// Extended historical-linguistics dataset. Dates and reconstructions are explicitly qualified.
const record = {
  "id": "aramaic",
  "language": "Aramaic (historical language continuum)",
  "kind": "script",
  "data": {
    "script": {
      "history": "The Aramaic consonantal alphabet is written right-to-left. Old Aramaic inscriptional forms gave way to a widely used Imperial/official chancery hand; after imperial standardization weakened, regional cursive and monumental styles diverged. The tradition became a source for Jewish square script, Palmyrene, Syriac, Mandaic, and Nabataean; Nabataean script development is important to Arabic script history. Descendant scripts are related but not interchangeable: ductus, ligatures, letterforms, and later vowel pointing differ by community and period.",
      "subscripts": "No productive subscript alphabet in Imperial Aramaic. Scholarly transliteration may use subscript numerals or dots as editorial notation; those are not Aramaic script characters.",
      "diacritics": "Early abjads generally leave short vowels unwritten; later script traditions developed distinct pointing systems. These vowel marks are tradition-specific and must not be projected backward onto Imperial Aramaic. Combining marks in later Syriac/Hebrew text have their own Unicode blocks and ordering rules.",
      "strokeNotes": "Unicode encodes character identity and text order, not ductus. Paleographic letterforms evolve through inscriptions and manuscripts; code point identity does not prescribe historical stroke order.",
      "unicodeExamples": [
        {
          "text": "𐡀",
          "points": [
            67648
          ],
          "note": "Imperial Aramaic Aleph"
        },
        {
          "text": "𐡁",
          "points": [
            67649
          ],
          "note": "Imperial Aramaic Beth"
        },
        {
          "text": "𐡂",
          "points": [
            67650
          ],
          "note": "Imperial Aramaic Gimel"
        },
        {
          "text": "𐡃",
          "points": [
            67651
          ],
          "note": "Imperial Aramaic Daleth"
        }
      ]
    },
    "unicode": {
      "system": "Imperial Aramaic U+10840–U+1085F is encoded separately from Hebrew, Syriac, Nabataean, Palmyrene, and other related scripts. Text direction is right-to-left.",
      "examples": [
        [
          "𐡀",
          [
            67648
          ],
          "Imperial Aramaic Aleph"
        ],
        [
          "𐡁",
          [
            67649
          ],
          "Imperial Aramaic Beth"
        ],
        [
          "𐡂",
          [
            67650
          ],
          "Imperial Aramaic Gimel"
        ],
        [
          "𐡃",
          [
            67651
          ],
          "Imperial Aramaic Daleth"
        ]
      ],
      "subscripts": "No productive subscript alphabet in Imperial Aramaic. Scholarly transliteration may use subscript numerals or dots as editorial notation; those are not Aramaic script characters.",
      "diacritics": "Early abjads generally leave short vowels unwritten; later script traditions developed distinct pointing systems. These vowel marks are tradition-specific and must not be projected backward onto Imperial Aramaic. Combining marks in later Syriac/Hebrew text have their own Unicode blocks and ordering rules.",
      "stroke": "Unicode encodes character identity and text order, not ductus. Paleographic letterforms evolve through inscriptions and manuscripts; code point identity does not prescribe historical stroke order."
    }
  },
  "sources": [
    {
      "id": "A1",
      "label": "Cambridge History of Iran, Aramaic in the Achaemenian Empire and earliest inscriptions",
      "url": "https://doi.org/10.1017/CHOL9780521200912.016"
    },
    {
      "id": "A2",
      "label": "Encyclopaedia Iranica, Aramaic language and its history",
      "url": "https://iranicaonline.org/articles/aramaic-i"
    },
    {
      "id": "A3",
      "label": "Mnamon, Aramaic writing systems and descendants",
      "url": "https://mnamon.sns.it/index.php?id=7&lang=en&page=Scrittura"
    },
    {
      "id": "A4",
      "label": "Mnamon, Aramaic language stages",
      "url": "https://mnamon.sns.it/index.php?id=7&lang=en&page=Lingua"
    },
    {
      "id": "A5",
      "label": "Unicode 18, Imperial Aramaic chart",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U10840.pdf"
    },
    {
      "id": "A6",
      "label": "Unicode Standard, Chapter 10 Middle East-I",
      "url": "https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-10/"
    },
    {
      "id": "A7",
      "label": "OCIANA, Nabataean and early Arabic inscriptions",
      "url": "https://krc.orient.ox.ac.uk/ociana/"
    },
    {
      "id": "A8",
      "label": "Comprehensive Aramaic Lexicon, dialect and text resources",
      "url": "https://cal.huc.edu/"
    },
    {
      "id": "A9",
      "label": "Encyclopaedia Iranica, Aramaic script descendants and Nabataean development",
      "url": "https://www.iranicaonline.org/articles/aramaic/i-general/"
    }
  ]
};
export default record;
