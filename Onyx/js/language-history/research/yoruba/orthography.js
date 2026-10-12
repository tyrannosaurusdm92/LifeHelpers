// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "yoruba",
  "language": "Yoruba (standard orthography; dialect continuum)",
  "category": "African",
  "kind": "orthography-and-unicode",
  "data": {
    "script": {
      "name": "Adapted Latin alphabet; Arabic Ajami used in some communities",
      "stages": [
        "Pre-standard oral and manuscript traditions",
        "19th-century missionary Latin literacy",
        "Orthography standardization in 1875-era and later work",
        "1974 standard and ongoing digital/educational conventions",
        "2026 digital corpus and proposed contour-tone notation"
      ],
      "glyphNotes": "Underdots and stacked tone marks change the letter/grapheme distinction. Handwritten dots, printed marks and font placement vary; Unicode records code points and combining behavior, not physical stroke order. A 2026 proposal uses caron/circumflex for contour tones, but that is not the 1974 standard.",
      "unicodeExamples": [
        {
          "text": "Ẹ",
          "points": [
            "U+1EB8"
          ],
          "meaning": "capital E with dot below"
        },
        {
          "text": "ẹ",
          "points": [
            "U+1EB9"
          ],
          "meaning": "small e with dot below"
        },
        {
          "text": "Ṣ",
          "points": [
            "U+1E62"
          ],
          "meaning": "capital S with dot below"
        },
        {
          "text": "ṣ",
          "points": [
            "U+1E63"
          ],
          "meaning": "small s with dot below"
        },
        {
          "text": "ẹ́",
          "points": [
            "U+1EB9",
            "U+0301"
          ],
          "meaning": "precomposed underdotted e plus combining acute"
        },
        {
          "text": "ẹ́",
          "points": [
            "U+0065",
            "U+0323",
            "U+0301"
          ],
          "meaning": "decomposed base, dot below, acute; normalize carefully"
        },
        {
          "text": "ń",
          "points": [
            "U+0144"
          ],
          "meaning": "small n with acute; high tone on a syllabic nasal"
        },
        {
          "text": "ǹ",
          "points": [
            "U+01F9"
          ],
          "meaning": "small n with grave; low tone on a syllabic nasal"
        },
        {
          "text": "n̄",
          "points": [
            "U+006E",
            "U+0304"
          ],
          "meaning": "n plus combining macron; mid tone may be marked to disambiguate"
        },
        {
          "text": "ǎ",
          "points": [
            "U+0061",
            "U+030C"
          ],
          "meaning": "base a plus combining caron, shown only as a proposed contour-tone notation"
        }
      ],
      "normalization": "Support both precomposed and combining sequences; NFC is convenient, but compare normalized grapheme sequences. Never drop underdots or tone marks from canonical Yoruba text.",
      "subscripts": "Underdots are combining diacritics, not subscript letters. No native subscript letters in standard Yoruba orthography.",
      "toneMarkConventions": {
        "standard": {
          "high": "COMBINING ACUTE ACCENT U+0301",
          "low": "COMBINING GRAVE ACCENT U+0300",
          "mid": "usually unmarked; COMBINING MACRON U+0304 may disambiguate a syllabic nasal"
        },
        "researchProposal": {
          "rising": "COMBINING CARON U+030C",
          "falling": "COMBINING CIRCUMFLEX U+0302",
          "status": "2026 preprint proposal; not part of the standard orthography"
        }
      },
      "sources": [
        "Y5",
        "Y6",
        "Y7",
        "Y9",
        "Y10",
        "Y11",
        "U1",
        "U2",
        "U3"
      ]
    }
  },
  "sources": [
    {
      "id": "Y5",
      "label": "Yoruba tone-mark restoration study",
      "url": "https://journals.agh.edu.pl/csci/article/view/2128"
    },
    {
      "id": "Y7",
      "label": "Yoruba Writing: Standards and Trends",
      "url": "https://www.theartsjournal.org/index.php/site/article/view/50"
    },
    {
      "id": "Y9",
      "label": "Oxford Scholarship Online, Yoruba orthography and the 1974 standard",
      "url": "https://academic.oup.com/princeton-scholarship-online/book/60415/chapter-abstract/520979142"
    },
    {
      "id": "Y10",
      "label": "Tubosun, Marking Contour Tones in Yorùbá (2026 preprint)",
      "url": "https://arxiv.org/abs/2609.38627"
    },
    {
      "id": "Y11",
      "label": "Tubosun et al., ÌròyìnSpeech tone-marked Yorùbá corpus and normalization (2026 preprint)",
      "url": "https://arxiv.org/abs/2610.05366"
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
      "id": "U3",
      "label": "Unicode Latin Extended Additional chart",
      "url": "https://www.unicode.org/charts/PDF/U1E00.pdf"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
