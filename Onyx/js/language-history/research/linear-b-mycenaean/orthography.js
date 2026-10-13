// Extended historical-linguistics dataset. Dates and reconstructions are explicitly qualified.
const record = {
  "id": "linear-b-mycenaean",
  "language": "Mycenaean Greek (recorded in Linear B; script/language distinguished)",
  "kind": "script",
  "data": {
    "script": {
      "history": "Linear B descends from/adapts the earlier Linear A sign system for Greek. It combines syllabograms with ideograms and numerical signs, written primarily left-to-right on clay tablets. The script was deciphered, but some sign values and readings remain disputed or unknown. Editorial transliterations use hyphens between signs; a notation like pa₂ is a Latin scholarly label with a subscript numeral, not a special Linear B glyph.",
      "subscripts": "Subscript numerals in transliterations (e.g. pa₂) disambiguate sign labels or readings; they are Latin editorial characters, typically U+2082, not native subscripts in Linear B.",
      "diacritics": "Linear B does not mark Greek accentuation or vowel length in a way comparable to later Greek orthography. Diacritics used in scholarly Greek forms belong to transliteration/editorial practice. Preserve original sign sequence separately from normalized transliteration.",
      "strokeNotes": "Paleographic variation among scribes is essential evidence. Unicode encodes sign identity but does not specify wedge/stroke order, tablet orientation, line layout, or archaeological damage.",
      "unicodeExamples": [
        {
          "text": "𐀀",
          "points": [
            65536
          ],
          "note": "Linear B Syllable B008 A"
        },
        {
          "text": "𐀁",
          "points": [
            65537
          ],
          "note": "Linear B Syllable B038 E"
        },
        {
          "text": "𐀒",
          "points": [
            65554
          ],
          "note": "Linear B Syllable B001 DA"
        },
        {
          "text": "𐀀𐀀",
          "points": [
            65536,
            65536
          ],
          "note": "Two encoded signs; no implicit hyphen or word boundary"
        }
      ]
    },
    "unicode": {
      "system": "Linear B Syllabary U+10000–U+1007F; Linear B Ideograms U+10080–U+100FF; Aegean Numbers U+10100–U+1013F. Unicode characters represent encoded signs; editorial transliteration systems are separate.",
      "examples": [
        [
          "𐀀",
          [
            65536
          ],
          "Linear B Syllable B008 A"
        ],
        [
          "𐀁",
          [
            65537
          ],
          "Linear B Syllable B038 E"
        ],
        [
          "𐀒",
          [
            65554
          ],
          "Linear B Syllable B001 DA"
        ],
        [
          "𐀀𐀀",
          [
            65536,
            65536
          ],
          "Two encoded signs; no implicit hyphen or word boundary"
        ]
      ],
      "subscripts": "Subscript numerals in transliterations (e.g. pa₂) disambiguate sign labels or readings; they are Latin editorial characters, typically U+2082, not native subscripts in Linear B.",
      "diacritics": "Linear B does not mark Greek accentuation or vowel length in a way comparable to later Greek orthography. Diacritics used in scholarly Greek forms belong to transliteration/editorial practice. Preserve original sign sequence separately from normalized transliteration.",
      "stroke": "Paleographic variation among scribes is essential evidence. Unicode encodes sign identity but does not specify wedge/stroke order, tablet orientation, line layout, or archaeological damage."
    }
  },
  "sources": [
    {
      "id": "L1",
      "label": "DAMOS, Mycenaean Greek corpus and chronology",
      "url": "https://damos.hf.uio.no/"
    },
    {
      "id": "L2",
      "label": "Cambridge, Reconstructing Linear B orthography",
      "url": "https://www.cambridge.org/core/books/abs/cambridge-handbook-of-historical-orthography/reconstructing-a-prehistoric-writing-system/84669342E99B2AFFD11C92C1C0F8A7C9"
    },
    {
      "id": "L3",
      "label": "Cambridge, Linear B orthography and scribal training at Pylos",
      "url": "https://www.cambridge.org/core/journals/cambridge-classical-journal/article/learning-to-spell-in-linear-b-orthography-and-scribal-training-in-mycenaean-pylos/50556D5B86414A3958575FB2C24B6FD1"
    },
    {
      "id": "L4",
      "label": "Cambridge, Mycenaean Greek and Linear B writing history",
      "url": "https://www.cambridge.org/core/books/abs/mycenaean-civilization/writing/EB5ECBEA47BC80092C06D810380E627B"
    },
    {
      "id": "L5",
      "label": "Unicode 18, Linear B Syllabary",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U10000.pdf"
    },
    {
      "id": "L6",
      "label": "Unicode 18, Linear B Ideograms",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U10080.pdf"
    },
    {
      "id": "L7",
      "label": "Unicode 18, Aegean Numbers",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U10100.pdf"
    },
    {
      "id": "L8",
      "label": "Cambridge, Linear B undeciphered sign values and limits",
      "url": "https://www.cambridge.org/core/books/undeciphered-signs-of-linear-b/83BE86635C83A49DDED8A14816E9FBC1"
    }
  ]
};
export default record;
