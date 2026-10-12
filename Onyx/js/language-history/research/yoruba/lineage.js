// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "yoruba",
  "language": "Yoruba (standard orthography; dialect continuum)",
  "category": "African",
  "kind": "lineage",
  "data": {
    "familyTree": [
      "Niger-Congo (classification contested at highest levels)",
      "Volta-Niger / Benue-Congo groupings vary",
      "Yoruboid",
      "Edekiri / Yoruba varieties"
    ],
    "siblings": [
      "Igala",
      "Itsekiri / Iṣẹkiri",
      "Yoruba varieties including Ọ̀yọ́, Èkìtì, Ìjẹ̀bú and Ìjẹ̀ṣà",
      "Other Edekiri varieties (subgroup labels vary)"
    ],
    "root": {
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
    }
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
      "id": "Y3",
      "label": "Oxford Handbook Topics in Linguistics, Niger-Congo classification review",
      "url": "https://academic.oup.com/edited-volume/42051/chapter/355823946"
    },
    {
      "id": "Y4",
      "label": "Akinkugbe, An Internal Classification of Yoruboid",
      "url": "https://journalofwestafricanlanguages.org/downloads/summary/31-volume1101/131-an-internal-classification-of-the-yoruboid-group-yoruba-isekiri-igala"
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
