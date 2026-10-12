// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "hebrew",
  "language": "Hebrew (Biblical through Modern)",
  "category": "Middle Eastern",
  "kind": "orthography-and-unicode",
  "data": {
    "script": {
      "name": "Phoenician-derived Paleo-Hebrew, then Aramaic-derived square Hebrew",
      "stages": [
        "Proto-Canaanite / Phoenician alphabet traditions",
        "Paleo-Hebrew in Iron Age contexts",
        "Gradual adoption of Aramaic-derived square script in Persian period",
        "Masoretic niqqud and cantillation in manuscript reading traditions",
        "Modern mostly unpointed Hebrew in RTL digital text"
      ],
      "glyphNotes": "Paleo-Hebrew and square letters have distinct historical strokes and shapes. Vowel points are later combining signs around consonants; final forms are separate letters. Unicode encodes text and combining marks, not handwriting paths.",
      "unicodeExamples": [
        {
          "text": "ב",
          "points": [
            "U+05D1"
          ],
          "meaning": "bet"
        },
        {
          "text": "ך",
          "points": [
            "U+05DA"
          ],
          "meaning": "final kaf, separate code point"
        },
        {
          "text": "ְ",
          "points": [
            "U+05B0"
          ],
          "meaning": "sheva niqqud combining point"
        },
        {
          "text": "ָ",
          "points": [
            "U+05B8"
          ],
          "meaning": "qamats niqqud combining point"
        },
        {
          "text": "שׁ",
          "points": [
            "U+05E9",
            "U+05C1"
          ],
          "meaning": "shin with combining shin dot"
        }
      ],
      "normalization": "Keep logical RTL character order and combining marks. NFC/NFD may change code-point sequences; test mixed-direction punctuation and selection. Do not remove niqqud from pointed source text.",
      "subscripts": "Niqqud can appear below a consonant but are combining vowel points, not subscript letters; Hebrew has no native subscript letters.",
      "sources": [
        "H1",
        "H3",
        "H4",
        "U1",
        "U2",
        "U4"
      ]
    }
  },
  "sources": [
    {
      "id": "H3",
      "label": "Mnamon, Hebrew writing systems",
      "url": "https://mnamon.sns.it/index.php?id=8&lang=en&page=Scrittura"
    },
    {
      "id": "H4",
      "label": "Bar-Ilan University, Paleo-Hebrew script history",
      "url": "https://cris.biu.ac.il/ws/portalfiles/portal/55985668/3511_Article_Text_15900_1_10_20171121.pdf"
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
    },
    {
      "id": "U4",
      "label": "Unicode Hebrew chart",
      "url": "https://www.unicode.org/charts/PDF/U0590.pdf"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
