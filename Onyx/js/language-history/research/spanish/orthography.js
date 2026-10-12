// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "spanish",
  "language": "Spanish",
  "category": "Romance",
  "kind": "orthography-and-unicode",
  "data": {
    "script": {
      "name": "Latin alphabet, modern Spanish orthography",
      "stages": [
        "Roman capitals and cursive traditions",
        "Late antique and medieval book/cursive scripts",
        "Printing and early modern codification",
        "Modern Spanish alphabet and punctuation"
      ],
      "glyphNotes": "Letterforms and writing tools change the visible stroke shape; the ñ tilde descends from an abbreviation mark over n in medieval practice. Unicode stores text values, not handwriting trajectories.",
      "unicodeExamples": [
        {
          "text": "ñ",
          "points": [
            "U+00F1"
          ],
          "meaning": "Spanish letter eñe; NFC example"
        },
        {
          "text": "ñ",
          "points": [
            "U+006E",
            "U+0303"
          ],
          "meaning": "NFD sequence rendering the same grapheme"
        },
        {
          "text": "á",
          "points": [
            "U+00E1"
          ],
          "meaning": "acute-accented a"
        },
        {
          "text": "é",
          "points": [
            "U+00E9"
          ],
          "meaning": "acute-accented e"
        },
        {
          "text": "í",
          "points": [
            "U+00ED"
          ],
          "meaning": "acute-accented i"
        },
        {
          "text": "ó",
          "points": [
            "U+00F3"
          ],
          "meaning": "acute-accented o"
        },
        {
          "text": "ú",
          "points": [
            "U+00FA"
          ],
          "meaning": "acute-accented u"
        },
        {
          "text": "ü",
          "points": [
            "U+00FC"
          ],
          "meaning": "u with diaeresis in güe/güi"
        },
        {
          "text": "¿",
          "points": [
            "U+00BF"
          ],
          "meaning": "inverted question mark"
        },
        {
          "text": "¡",
          "points": [
            "U+00A1"
          ],
          "meaning": "inverted exclamation mark"
        },
        {
          "text": "́",
          "points": [
            "U+0301"
          ],
          "meaning": "combining acute accent in decomposed text"
        },
        {
          "text": "̃",
          "points": [
            "U+0303"
          ],
          "meaning": "combining tilde in decomposed ñ"
        }
      ],
      "normalization": "Preserve accents, ñ, ü and punctuation. Normalize at a system boundary, usually NFC for storage/display interoperability; never strip marks from canonical text.",
      "subscripts": "No native subscript letters in the standard orthography. Linguistic subscripts in IPA or metadata belong to a separate notation layer.",
      "sources": [
        "S4",
        "S5",
        "S6",
        "S7",
        "U1",
        "U2"
      ]
    }
  },
  "sources": [
    {
      "id": "S5",
      "label": "RAE-ASALE, Diccionario panhispánico de dudas: u and diéresis",
      "url": "https://www.rae.es/dpd/u"
    },
    {
      "id": "S6",
      "label": "Cambridge, Latin Script in Antiquity",
      "url": "https://www.cambridge.org/core/books/abs/latin-palaeography/latin-script-in-antiquity/7AAE013BCD262AB689DE4B2FAAD02B0D"
    },
    {
      "id": "S7",
      "label": "FundéuRAE, medieval origin of ñ",
      "url": "https://www.fundeu.es/noticia/cual-es-el-origen-de-la-letra-n-y-que-otras-lenguas-la-utilizan/"
    },
    {
      "id": "U1",
      "label": "Unicode Consortium, Characters and Combining Marks FAQ",
      "url": "https://www.unicode.org/faq/char_combmark.html"
    },
    {
      "id": "U2",
      "label": "Unicode Standard Annex #15, Normalization Forms",
      "url": "https://www.unicode.org/reports/tr15/"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
