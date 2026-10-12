// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "spanish",
  "language": "Spanish",
  "category": "Romance",
  "kind": "lineage",
  "data": {
    "familyTree": [
      "Indo-European",
      "Italic",
      "Latin",
      "Romance",
      "Ibero-Romance",
      "Castilian / Spanish"
    ],
    "siblings": [
      "Portuguese and Galician",
      "Astur-Leonese",
      "Aragonese",
      "Catalan (its position within Romance classifications is described differently)",
      "French",
      "Italian",
      "Sardinian",
      "Romanian"
    ],
    "root": {
      "node": "Latin / early Italic evidence",
      "date": "Latin inscriptions survive from the seventh–sixth centuries BCE; some individual early inscriptions have contested dating or language attribution.",
      "evidenceType": "inscriptional attestation",
      "confidence": "high for attestation; moderate for individual object dating",
      "caution": "This is the age of an ancestor and written record, not the birth date of Spanish. Spoken Latin diversified regionally over centuries; Spanish is a medieval Romance language.",
      "ageAssessment": {
        "requestedMinimumBP": 2500,
        "qualifyingAgeBP": 2549,
        "rangeBP": [
          2549,
          2649
        ],
        "ancestorStage": "Archaic Latin inscriptional record",
        "basis": "Approximate conversion of seventh–sixth-century BCE attestation to years before 1950; individual artifact dates vary.",
        "qualification": "meets threshold at the early Romance ancestor level",
        "sourceKeys": [
          "S1"
        ]
      }
    }
  },
  "sources": [
    {
      "id": "S1",
      "label": "Cambridge, The Indo-European Language Family: Italic",
      "url": "https://www.cambridge.org/core/books/indoeuropean-language-family/italic/473A395FABB6E9FB91AE75076F390D29"
    },
    {
      "id": "S2",
      "label": "Oxford, From Latin to Romance in Sound Charts",
      "url": "https://academic.oup.com/book/26021"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
