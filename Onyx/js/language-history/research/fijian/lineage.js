// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "fijian",
  "language": "Fijian (standard, Bauan-influenced)",
  "category": "Oceanic",
  "kind": "lineage",
  "data": {
    "familyTree": [
      "Austronesian",
      "Malayo-Polynesian",
      "Oceanic",
      "Central Pacific",
      "Fijian varieties",
      "Standard Fijian"
    ],
    "siblings": [
      "Eastern and Western Fijian varieties",
      "Polynesian languages through Proto-Polynesian (including Tongan, Samoan, Māori and others)",
      "Rotuman (placement and history require care; do not call it an uncontested direct sibling)"
    ],
    "root": {
      "node": "Proto-Oceanic / later Central Pacific ancestry",
      "date": "Proto-Oceanic is calibrated at about 3,000–3,300 years before present (BP, using the 1950 CE baseline standard in archaeology) in archaeological-language dating work; Central Pacific differentiation is later.",
      "evidenceType": "archaeology-informed phylogenetic calibration plus comparative reconstruction",
      "confidence": "moderate for the broad calibration; lower for fine-grained branch timing",
      "caution": "These are modeled dates for reconstructed ancestors, not written attestations. Fiji was an important diversification area; Fijian varieties and Polynesian languages descend through later Central Pacific history.",
      "ageAssessment": {
        "requestedMinimumBP": 2500,
        "qualifyingAgeBP": 3000,
        "rangeBP": [
          3000,
          3300
        ],
        "ancestorStage": "Proto-Oceanic",
        "basis": "Archaeology-informed calibration used in language-family dating research; BP baseline is 1950 CE.",
        "qualification": "meets threshold as a modeled ancestor date",
        "sourceKeys": [
          "F2",
          "F3"
        ]
      }
    }
  },
  "sources": [
    {
      "id": "F1",
      "label": "The Lexicon of Proto Oceanic, phonology and reconstruction method",
      "url": "https://tlopo.clld.org/contributions/5-1"
    },
    {
      "id": "F2",
      "label": "ANU Press, The Prehistory of Oceanic Languages",
      "url": "https://press.anu.edu.au/downloads/press/p69411/mobile/ch03.html"
    },
    {
      "id": "F3",
      "label": "Journal of Language Evolution, best practices for dating language families",
      "url": "https://doi.org/10.1093/jole/lzz009"
    },
    {
      "id": "F7",
      "label": "ANU, History of Polynesian Phonology",
      "url": "https://openresearch-repository.anu.edu.au/server/api/core/bitstreams/b9abd711-705b-4b8c-b5a9-d314f8587bed/content"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
