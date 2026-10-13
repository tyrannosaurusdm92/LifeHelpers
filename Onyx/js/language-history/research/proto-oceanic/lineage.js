// Extended historical-linguistics dataset. Dates and reconstructions are explicitly qualified.
const record = {
  "id": "proto-oceanic",
  "language": "Proto-Oceanic (POc; reconstructed ancestor, not a living language)",
  "kind": "lineage",
  "data": {
    "rootline": "Proto-Oceanic (POc) is a reconstructed ancestor of the Oceanic branch of Austronesian, itself a member of Malayo-Polynesian. POc is not directly written or spoken today, and its reconstructed forms are hypotheses supported by regular correspondences among daughter languages. Oceanic branches include western and eastern groups, with Central Pacific and Polynesian histories downstream; subgrouping remains an active research area.",
    "familyTree": [
      "Austronesian",
      "Malayo-Polynesian",
      "Central-Eastern Malayo-Polynesian",
      "Eastern Malayo-Polynesian",
      "Oceanic",
      "Proto-Oceanic",
      "Oceanic subgroups"
    ],
    "siblings": [
      "Western Oceanic descendants (e.g., North New Guinea, Papuan Tip, Meso-Melanesian groups)",
      "Admiralty Islands languages",
      "Temotu languages (subgrouping debated)",
      "Central Pacific languages (including Fijian and Polynesian)",
      "Micronesian languages"
    ],
    "root": {
      "node": "Proto-Oceanic",
      "qualifyingAgeBP": 3200,
      "rangeBP": [
        3000,
        3300
      ],
      "sourceKeys": [
        "P1",
        "P2"
      ],
      "confidence": "moderate as an archaeology-informed reconstruction; subgroup boundaries and dates vary",
      "basis": "Comparative reconstruction combined with Lapita-related archaeological chronology; reconstructed speech community is usually placed in the Bismarck Archipelago in the late second millennium BCE.",
      "date": "Comparative reconstruction combined with Lapita-related archaeological chronology; reconstructed speech community is usually placed in the Bismarck Archipelago in the late second millennium BCE.",
      "evidenceType": "Comparative reconstruction combined with Lapita-related archaeological chronology; reconstructed speech community is usually placed in the Bismarck Archipelago in the late second millennium BCE.",
      "caution": "moderate as an archaeology-informed reconstruction; subgroup boundaries and dates vary",
      "ageAssessment": {
        "requestedMinimumBP": 2500,
        "qualifyingAgeBP": 3200,
        "rangeBP": [
          3000,
          3300
        ],
        "ancestorStage": "Proto-Oceanic",
        "basis": "Comparative reconstruction combined with Lapita-related archaeological chronology; reconstructed speech community is usually placed in the Bismarck Archipelago in the late second millennium BCE.",
        "qualification": "meets threshold with explicit uncertainty; see lineage note",
        "datingMethod": "Comparative lexical and phonological reconstruction calibrated against Lapita-related archaeological chronology; comparative subgrouping alone supplies relative order, not absolute dates.",
        "rangeInterpretation": "An archaeology-informed estimate for the reconstructed speech community, not a confidence interval or a direct linguistic date.",
        "qualifyingAgeMeaning": "3,200 BP is an estimate for the Proto-Oceanic speech-community horizon; no contemporary written attestation is known.",
        "documentation": {
          "status": "none-known",
          "stage": "Proto-Oceanic",
          "dateLabel": "No contemporary text or known native writing system; forms are reconstructed from descendant languages.",
          "note": "Modern Latin and IPA forms are scholarly transcriptions, not ancient glyphs.",
          "sourceKeys": ["P1", "P2"]
        },
        "sourceKeys": [
          "P1",
          "P2"
        ]
      }
    }
  },
  "sources": [
    {
      "id": "P1",
      "label": "ANU Press, The Prehistory of Oceanic Languages: current view",
      "url": "https://press.anu.edu.au/downloads/press/p69411/mobile/ch03.html"
    },
    {
      "id": "P2",
      "label": "ANU Press, The Lexicon of Proto Oceanic",
      "url": "https://press.anu.edu.au/publications/lexicon-proto-oceanic"
    },
    {
      "id": "P3",
      "label": "The Lexicon of Proto Oceanic, phonology and reconstruction method",
      "url": "https://tlopo.clld.org/contributions/5-1"
    },
    {
      "id": "P4",
      "label": "ANU Press, Oceanic subgrouping hypotheses",
      "url": "https://press.anu.edu.au/downloads/press/p69411/mobile/ch02s03.html"
    },
    {
      "id": "P5",
      "label": "ANU Press, Oceanic subgroup and POc culture",
      "url": "https://press.anu.edu.au/downloads/press/p69411/mobile/ch03s02.html"
    },
    {
      "id": "P6",
      "label": "Journal of Language Evolution, best practices for dating language families",
      "url": "https://doi.org/10.1093/jole/lzz009"
    },
    {
      "id": "P7",
      "label": "TLOPO, POc *patu and Bauan Fijian vatu correspondence",
      "url": "https://tlopo.clld.org/contributions/1-4"
    },
    {
      "id": "P8",
      "label": "ANU Press, Lapita and linguistic prehistory",
      "url": "https://press.anu.edu.au/downloads/press/p69411/mobile/ch06s03.html"
    }
  ]
};
export default record;
