// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "hebrew",
  "language": "Hebrew (Biblical through Modern)",
  "category": "Middle Eastern",
  "kind": "lineage",
  "data": {
    "familyTree": [
      "Afro-Asiatic",
      "Semitic",
      "West Semitic",
      "Central Semitic",
      "Northwest Semitic",
      "Canaanite",
      "Hebrew"
    ],
    "siblings": [
      "Phoenician",
      "Ammonite",
      "Moabite",
      "Edomite",
      "Aramaic (close Northwest Semitic relative, usually classified outside Canaanite)",
      "Ugaritic (Late Bronze Northwest Semitic; some references include it within Canaanite, while others draw a narrower boundary)"
    ],
    "root": {
      "node": "Canaanite within Northwest Semitic; deeper Semitic ancestry is reconstructed",
      "date": "Canaanite evidence spans roughly 1550–1200 BCE; Hebrew becomes a distinct identifiable language around the Late Bronze / Iron Age transition, not at one exact year.",
      "evidenceType": "inscriptional evidence plus comparative Semitic reconstruction",
      "confidence": "moderate to high for broad classification and period; boundaries are gradual",
      "caution": "The date of Canaanite evidence is not the birth date of Proto-Semitic or Modern Hebrew. Neighboring languages form a continuum, and Hebrew developed through ancient, post-biblical and modern stages.",
      "ageAssessment": {
        "requestedMinimumBP": 2500,
        "qualifyingAgeBP": 3149,
        "rangeBP": [
          3149,
          3499
        ],
        "ancestorStage": "Canaanite evidence within Northwest Semitic",
        "basis": "Approximate conversion of c.1550–1200 BCE evidence to years before 1950; Hebrew’s differentiation is gradual.",
        "qualification": "meets threshold as an ancestor-family evidence window, not a precise Hebrew birth date",
        "sourceKeys": [
          "H1",
          "H2"
        ]
      }
    }
  },
  "sources": [
    {
      "id": "H1",
      "label": "Cambridge, Hebrew in The Ancient Languages of Syria-Palestine and Arabia",
      "url": "https://www.cambridge.org/core/books/abs/ancient-languages-of-syriapalestine-and-arabia/hebrew/512F0FC4796BF3DB1137C1A9BA228DB1"
    },
    {
      "id": "H2",
      "label": "University of Texas at Austin, The Canaanite Languages",
      "url": "https://sites.utexas.edu/scripts/files/2020/10/2019-AWW-The-Canaanite-Languages.pdf"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
