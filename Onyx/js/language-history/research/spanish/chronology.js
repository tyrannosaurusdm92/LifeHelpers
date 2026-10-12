// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "spanish",
  "language": "Spanish",
  "category": "Romance",
  "kind": "chronology",
  "data": {
    "rootEvidence": {
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
    },
    "events": [
      {
        "date": "7th–6th c. BCE",
        "event": "Archaic Latin inscriptions are attested",
        "evidence": "inscription",
        "certainty": "high overall; individual objects may be disputed",
        "sources": [
          "S1"
        ]
      },
      {
        "date": "1st millennium CE",
        "event": "Regional spoken Latin differentiates into Romance varieties over centuries",
        "evidence": "comparative reconstruction and written record",
        "certainty": "high for gradual diversification; no single split year",
        "sources": [
          "S2"
        ]
      },
      {
        "date": "Medieval period",
        "event": "Early Romance and Castilian writing becomes visible in surviving records",
        "evidence": "manuscript attestation",
        "certainty": "high as a broad period",
        "sources": [
          "S2",
          "S6"
        ]
      },
      {
        "date": "1492 onward",
        "event": "Grammar, print, administration and imperial expansion help codify and extend Spanish",
        "evidence": "dated publication and social history",
        "certainty": "high as milestones; not a language-birth date",
        "sources": [
          "S2"
        ]
      }
    ]
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
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
