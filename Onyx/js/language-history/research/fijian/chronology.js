// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "fijian",
  "language": "Fijian (standard, Bauan-influenced)",
  "category": "Oceanic",
  "kind": "chronology",
  "data": {
    "rootEvidence": {
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
    },
    "events": [
      {
        "date": "c. 3,000–3,300 BP (1950 CE baseline)",
        "event": "Proto-Oceanic dispersal is used as an archaeological calibration",
        "evidence": "settlement archaeology plus Bayesian phylogenetic model",
        "certainty": "moderate; model-dependent, not direct language attestation",
        "sources": [
          "F2",
          "F3"
        ]
      },
      {
        "date": "Later prehistory",
        "event": "Proto-Central Pacific diversifies in and around Fiji into regional lineages",
        "evidence": "comparative reconstruction",
        "certainty": "moderate for sequence; exact dates uncertain",
        "sources": [
          "F1",
          "F2",
          "F7"
        ]
      },
      {
        "date": "Late 1830s onward",
        "event": "Missionary printing and translation establish Latin spelling conventions",
        "evidence": "documented print and mission history",
        "certainty": "high for broad process",
        "sources": [
          "F4",
          "F6"
        ]
      }
    ]
  },
  "sources": [
    {
      "id": "F3",
      "label": "Journal of Language Evolution, best practices for dating language families",
      "url": "https://doi.org/10.1093/jole/lzz009"
    },
    {
      "id": "F4",
      "label": "Albert J. Schütz, The Fijian Language, University of Hawai‘i Press",
      "url": "https://manifold.uhpress.hawaii.edu/projects/the-fijian-language"
    },
    {
      "id": "F6",
      "label": "Cambridge Museum of Archaeology and Anthropology, Fiji missionaries",
      "url": "https://maa.cam.ac.uk/Fiji-missionaries"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
