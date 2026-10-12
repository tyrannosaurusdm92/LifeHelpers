// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "fijian",
  "language": "Fijian (standard, Bauan-influenced)",
  "category": "Oceanic",
  "kind": "orthography-and-unicode",
  "data": {
    "script": {
      "name": "Latin-based standard orthography, strongly Bauan-influenced",
      "stages": [
        "Oral transmission and regional varieties",
        "Early explorer/missionary spellings",
        "Late 1830s printing and scripture translation",
        "Standard written Fijian with stable letter values"
      ],
      "glyphNotes": "Letter values were chosen within Latin type and printing constraints. The printed glyph is not a phonetic description: b/d/q encode prenasalized sounds; c/g have non-English values. Unicode does not encode stroke order.",
      "unicodeExamples": [
        {
          "text": "b",
          "points": [
            "U+0062"
          ],
          "meaning": "standard Fijian grapheme commonly /mb/"
        },
        {
          "text": "d",
          "points": [
            "U+0064"
          ],
          "meaning": "standard Fijian grapheme commonly /nd/"
        },
        {
          "text": "q",
          "points": [
            "U+0071"
          ],
          "meaning": "standard Fijian grapheme commonly /ŋg/"
        },
        {
          "text": "c",
          "points": [
            "U+0063"
          ],
          "meaning": "standard Fijian grapheme /ð/"
        },
        {
          "text": "dr",
          "points": [
            "U+0064",
            "U+0072"
          ],
          "meaning": "two code points; one special orthographic sequence"
        }
      ],
      "normalization": "Use NFC for ordinary storage. Keep standard spelling distinct from IPA and scholarly macron conventions; do not remove marks from cited transcriptions.",
      "subscripts": "No native subscript letters in standard Fijian spelling.",
      "sources": [
        "F4",
        "F5",
        "F6",
        "U1",
        "U2"
      ]
    }
  },
  "sources": [
    {
      "id": "F4",
      "label": "Albert J. Schütz, The Fijian Language, University of Hawai‘i Press",
      "url": "https://manifold.uhpress.hawaii.edu/projects/the-fijian-language"
    },
    {
      "id": "F6",
      "label": "Cambridge Museum of Archaeology and Anthropology, Fiji missionaries",
      "url": "https://maa.cam.ac.uk/Fiji-missionaries"
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
