// Extended historical-linguistics dataset. Dates and reconstructions are explicitly qualified.
const record = {
  "id": "linear-b-mycenaean",
  "language": "Mycenaean Greek (recorded in Linear B; script/language distinguished)",
  "kind": "lineage",
  "data": {
    "rootline": "Linear B is a writing system; the language it records is Mycenaean Greek, the earliest directly written Greek dialect. Greek belongs to Hellenic within Indo-European. Mycenaean is compared with later Greek varieties including Arcado-Cypriot, Attic-Ionic, Aeolic, and Doric groups. Linear A is a different, undeciphered script tradition and should not be called Greek merely because Linear B adapted some signs from it.",
    "familyTree": [
      "Indo-European",
      "Hellenic",
      "Greek",
      "Mycenaean Greek (Bronze Age dialect)",
      "Linear B (writing system, not a language)"
    ],
    "siblings": [
      "Attic-Ionic Greek (later branch/dialect group)",
      "Aeolic Greek",
      "Doric and Northwest Greek",
      "Arcado-Cypriot Greek (closest comparison group in many classifications)"
    ],
    "relatedScripts": [
      {
        "name": "Linear A",
        "relationship": "Earlier Aegean script tradition from which Linear B adapted signs",
        "note": "Its language remains undeciphered and it is not a Greek language sibling."
      },
      {
        "name": "Cypriot syllabary",
        "relationship": "Later, distinct script used for a Greek dialect",
        "note": "It is a script comparison, not a branch of Mycenaean Greek."
      }
    ],
    "root": {
      "node": "Proto-Greek / early Greek dialect continuum",
      "qualifyingAgeBP": 3600,
      "rangeBP": [
        3400,
        4000
      ],
      "sourceKeys": [
        "L1",
        "L2"
      ],
      "confidence": "moderate for chronology of Greek presence and linguistic identification; exact Proto-Greek split date is modeled",
      "basis": "Linear B tablets from the second millennium BCE directly record Mycenaean Greek; comparative Greek dialect history reconstructs earlier Proto-Greek ancestry.",
      "date": "Linear B tablets from the second millennium BCE directly record Mycenaean Greek; comparative Greek dialect history reconstructs earlier Proto-Greek ancestry.",
      "evidenceType": "Linear B tablets from the second millennium BCE directly record Mycenaean Greek; comparative Greek dialect history reconstructs earlier Proto-Greek ancestry.",
      "caution": "moderate for chronology of Greek presence and linguistic identification; exact Proto-Greek split date is modeled",
      "ageAssessment": {
        "requestedMinimumBP": 2500,
        "qualifyingAgeBP": 3600,
        "rangeBP": [
          3400,
          4000
        ],
        "ancestorStage": "Proto-Greek / early Greek dialect continuum",
        "basis": "Linear B tablets from the second millennium BCE directly record Mycenaean Greek; comparative Greek dialect history reconstructs earlier Proto-Greek ancestry.",
        "qualification": "meets threshold with explicit uncertainty; see lineage note",
        "datingMethod": "Comparative Greek dialect reconstruction paired with the epigraphic Mycenaean corpus in Linear B.",
        "rangeInterpretation": "A modeled Proto-Greek/early Greek horizon, separate from the archaeological dates of surviving Linear B tablets.",
        "qualifyingAgeMeaning": "3,600 BP is a model-based Greek ancestor horizon; Mycenaean Greek itself is written in tablets dated about 1450–1150 BCE.",
        "documentation": {
          "status": "epigraphic",
          "stage": "Mycenaean Greek in Linear B",
          "dateLabel": "Published Mycenaean documents date mainly to about 1450–1150 BCE; their administrative content and underspecified spelling limit linguistic inference.",
          "note": "Linear B is the script; Mycenaean Greek is the language.",
          "sourceKeys": ["L1"]
        },
        "sourceKeys": [
          "L1",
          "L2"
        ]
      }
    }
  },
  "sources": [
    {
      "id": "L1",
      "label": "DAMOS, Mycenaean Greek corpus and chronology",
      "url": "https://damos.hf.uio.no/"
    },
    {
      "id": "L2",
      "label": "Cambridge, Reconstructing Linear B orthography",
      "url": "https://www.cambridge.org/core/books/abs/cambridge-handbook-of-historical-orthography/reconstructing-a-prehistoric-writing-system/84669342E99B2AFFD11C92C1C0F8A7C9"
    },
    {
      "id": "L3",
      "label": "Cambridge, Linear B orthography and scribal training at Pylos",
      "url": "https://www.cambridge.org/core/journals/cambridge-classical-journal/article/learning-to-spell-in-linear-b-orthography-and-scribal-training-in-mycenaean-pylos/50556D5B86414A3958575FB2C24B6FD1"
    },
    {
      "id": "L4",
      "label": "Cambridge, Mycenaean Greek and Linear B writing history",
      "url": "https://www.cambridge.org/core/books/abs/mycenaean-civilization/writing/EB5ECBEA47BC80092C06D810380E627B"
    },
    {
      "id": "L5",
      "label": "Unicode 18, Linear B Syllabary",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U10000.pdf"
    },
    {
      "id": "L6",
      "label": "Unicode 18, Linear B Ideograms",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U10080.pdf"
    },
    {
      "id": "L7",
      "label": "Unicode 18, Aegean Numbers",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U10100.pdf"
    },
    {
      "id": "L8",
      "label": "Cambridge, Linear B undeciphered sign values and limits",
      "url": "https://www.cambridge.org/core/books/undeciphered-signs-of-linear-b/83BE86635C83A49DDED8A14816E9FBC1"
    }
  ]
};
export default record;
