// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "yoruba",
  "language": "Yoruba (standard orthography; dialect continuum)",
  "category": "African",
  "kind": "chronology",
  "data": {
    "rootEvidence": {
      "node": "Niger-Congo macrofamily expansion estimate, with the relevant Volta-Niger / Yoruboid branches treated separately",
      "date": "A Cambridge overview places Niger-Congo expansion near 12,000 BP; a Language Science Press overview describes Niger-Congo as a macrofamily or phylum at least 12 millennia old while emphasizing incomplete reconstruction and uneven evidence. For the closer Yoruba lineage, Ogundiran’s interdisciplinary model places Proto-Yoruboid development in a broad 2500–300 BCE period, with daughter differentiation by about 300 CE; that window runs from roughly 4,500 to 2,300 BP.",
      "evidenceType": "published macrofamily expansion interpretations plus lower-level comparative classification and an archaeology / oral-history informed branch model",
      "confidence": "low for an exact Niger-Congo root date or full reconstruction; low to moderate for Proto-Yoruboid calendar dates; stronger for related Yoruba, Itsekiri and Igala groupings",
      "caution": "The roughly 12,000 BP value is a broad family-expansion estimate, not a securely reconstructed point date for Proto-Niger-Congo. Only the early part of the Proto-Yoruboid window exceeds 2,500 years. These distinct claims should not be collapsed into a precise date for Yoruba.",
      "ageAssessment": {
        "requestedMinimumBP": 2500,
        "qualifyingAgeBP": 12000,
        "rangeBP": null,
        "localBranchRangeBP": [
          2300,
          4500
        ],
        "ancestorStage": "Niger-Congo macrofamily expansion estimate; local Proto-Yoruboid chronology is reported separately",
        "basis": "Broad expansion estimate in a Cambridge overview, supported by a Language Science Press overview of macrofamily time depth; this is not a securely reconstructed Proto-Niger-Congo date. The local branch model spans a wider range.",
        "qualification": "qualifies only as a broad, contested macrofamily estimate; local branch date is uncertain",
        "sourceKeys": [
          "Y1",
          "Y2",
          "Y3",
          "Y13",
          "Y14"
        ]
      }
    },
    "events": [
      {
        "date": "About 12,000 BP (broad literature estimate)",
        "event": "Niger-Congo expansion and macrofamily time depth are placed near or above this age in two scholarly overviews; internal classification and full proto-language reconstruction remain debated",
        "evidence": "historical-linguistic and interdisciplinary expansion interpretation",
        "certainty": "low to moderate; broad estimate and family-level controversy, not a precise proto-language date",
        "sources": [
          "Y3",
          "Y13",
          "Y14"
        ]
      },
      {
        "date": "Broadly 2500–300 BCE in one model",
        "event": "Proto-Yoruboid develops around the Niger–Benue confluence in Ogundiran’s interdisciplinary periodization",
        "evidence": "historical model integrating archaeology, linguistics and oral history",
        "certainty": "low to moderate; not a consensus point date",
        "sources": [
          "Y1",
          "Y2"
        ]
      },
      {
        "date": "By c. 300 CE in the same model",
        "event": "Proto-Igala, Proto-Itsekiri and Proto-Yoruba differentiate",
        "evidence": "comparative linguistic and historical inference",
        "certainty": "low to moderate; model-specific",
        "sources": [
          "Y1"
        ]
      },
      {
        "date": "19th c.",
        "event": "Missionary-era Latin orthography and literacy spread; Arabic Ajami is also used in some communities",
        "evidence": "written-history sources",
        "certainty": "moderate; practices differed by community",
        "sources": [
          "Y7",
          "Y8"
        ]
      },
      {
        "date": "1974 and later reviews",
        "event": "A standard orthography is established and later conventions remain debated",
        "evidence": "orthographic standardization history",
        "certainty": "high for standardization milestone; details vary",
        "sources": [
          "Y7"
        ]
      }
    ]
  },
  "sources": [
    {
      "id": "Y1",
      "label": "Akinwumi Ogundiran, The Yoruba: A New History",
      "url": "https://iupress.org/9780253051486/the-yoruba/"
    },
    {
      "id": "Y2",
      "label": "Cambridge, The Yoruba from Prehistory to the Present: Geography and Society",
      "url": "https://www.cambridge.org/core/books/yoruba-from-prehistory-to-the-present/geography-and-society/CC682B3D24A7A9648C018BABC1E2EDEA"
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
      "id": "Y11",
      "label": "Tubosun et al., ÌròyìnSpeech tone-marked Yorùbá corpus and normalization (2026 preprint)",
      "url": "https://arxiv.org/abs/2610.05366"
    },
    {
      "id": "Y13",
      "label": "Jeff Good, Niger-Congo languages, Cambridge Handbook of Areal Linguistics (2017)",
      "url": "https://doi.org/10.1017/9781107279872.018"
    },
    {
      "id": "Y14",
      "label": "Vydrin, East Benue-Congo preface on the Niger-Congo macrofamily and reconstruction (Language Science Press)",
      "url": "https://langsci-press.org/catalog/view/190/1074/1266-2"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
