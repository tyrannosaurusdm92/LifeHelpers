// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "mandarin",
  "language": "Mandarin Chinese (Standard Mandarin focus)",
  "category": "Asian / Sinitic",
  "kind": "sound-change",
  "data": {
    "rules": [
      {
        "name": "Loss of entering-tone stop codas in Mandarin",
        "input": "Middle Chinese syllables ending in /-p, -t, -k/",
        "outcome": "stop codas disappear in Mandarin varieties; items redistribute among later tones",
        "examples": "Middle Chinese “entering tone” category no longer exists as a final-stop category in Standard Mandarin",
        "scope": "Historical outcomes depend on initial class, dialect and tone history; not a single tone mapping.",
        "sources": [
          "M3",
          "M4"
        ]
      },
      {
        "name": "Onset-voicing-conditioned tone/register splits",
        "input": "earlier voiced versus voiceless onset classes in historical Chinese",
        "outcome": "conditioned tonal/register distinctions in multiple Sinitic branches",
        "examples": "historical tone categories do not map uniformly across Mandarin and non-Mandarin branches",
        "scope": "Branch-specific; the short record stores the conditioning relation, not a complete tone correspondence table.",
        "sources": [
          "M3",
          "M5"
        ]
      },
      {
        "name": "Old Mandarin rhyme-system reorganization",
        "input": "Middle Chinese distinctions in rhyme and tone categories",
        "outcome": "substantial reorganization documented in the 1324 Zhongyuan Yinyun system",
        "examples": "the rhyme book describes Old Mandarin and shares core traits with Modern Mandarin",
        "scope": "The book reflects a standard/composite phonological system and earlier northern innovations.",
        "sources": [
          "M4"
        ]
      }
    ]
  },
  "sources": [
    {
      "id": "M3",
      "label": "Cambridge, An Introduction to Chinese Historical Phonology",
      "url": "https://www.cambridge.org/core/books/abs/phonological-history-of-chinese/an-introduction-to-chinese-historical-phonology/7A1DECBDCB0C27F0486F3409A697D592"
    },
    {
      "id": "M4",
      "label": "Cambridge, Old Mandarin and Zhongyuan Yinyun",
      "url": "https://www.cambridge.org/core/books/abs/phonological-history-of-chinese/old-mandarin-the-zhongyuan-yinyun/25E3AB35BFBE15663813AA730A0F09EC"
    },
    {
      "id": "M5",
      "label": "Oxford Academic, Sinitic historical and typological overview",
      "url": "https://academic.oup.com/book/38951/chapter-abstract/338155819"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
