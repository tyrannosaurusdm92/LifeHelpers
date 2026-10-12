// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "hebrew",
  "language": "Hebrew (Biblical through Modern)",
  "category": "Middle Eastern",
  "kind": "chronology",
  "data": {
    "rootEvidence": {
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
    },
    "events": [
      {
        "date": "c. 1550–1200 BCE",
        "event": "Canaanite languages are represented in Late Bronze evidence",
        "evidence": "epigraphic and comparative linguistic evidence",
        "certainty": "moderate; individual dialect identifications vary",
        "sources": [
          "H1",
          "H2"
        ]
      },
      {
        "date": "Late Bronze / Early Iron transition",
        "event": "Hebrew becomes an identifiable Canaanite language; boundaries are gradual",
        "evidence": "inscriptions and comparative linguistic features",
        "certainty": "moderate; no single founding year",
        "sources": [
          "H1",
          "H2"
        ]
      },
      {
        "date": "Persian period onward",
        "event": "Aramaic-derived square script increasingly becomes the standard Hebrew script",
        "evidence": "paleographic record",
        "certainty": "high for transition; gradual and with parallel uses",
        "sources": [
          "H3",
          "H4"
        ]
      },
      {
        "date": "First millennium CE",
        "event": "Masoretic communities develop and transmit vowel-pointing and cantillation systems",
        "evidence": "manuscript and reading tradition",
        "certainty": "high as a broad process",
        "sources": [
          "H3",
          "U4"
        ]
      },
      {
        "date": "19th–20th c.",
        "event": "Modern spoken Hebrew revival and standardization",
        "evidence": "documented social and linguistic history",
        "certainty": "high broadly; not a return to identical Biblical pronunciation",
        "sources": [
          "H5"
        ]
      }
    ]
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
      "id": "H5",
      "label": "Stav Klein, Notes on Modern Hebrew phonology and orthography",
      "url": "https://cris.biu.ac.il/en/publications/notes-on-modern-hebrew-phonology-and-orthography/"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
