// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "fijian",
  "language": "Fijian (standard, Bauan-influenced)",
  "category": "Oceanic",
  "kind": "sound-change",
  "data": {
    "rules": [
      {
        "name": "Inherited *p correspondence",
        "input": "Proto-Oceanic *p in the inherited word set for “stone”",
        "outcome": "Bauan Fijian v",
        "examples": "*patu → vatu",
        "scope": "A comparative correspondence in a cited cognate set; not a blanket rewrite of all p or v.",
        "sources": [
          "F1",
          "F7",
          "F8"
        ]
      },
      {
        "name": "Prenasalized stop formation in Proto-Oceanic",
        "input": "some earlier homorganic nasal + obstruent sequences",
        "outcome": "unitary prenasalized voiced obstruents in reconstructed Proto-Oceanic",
        "examples": "standard Fijian orthographic b /mb/, d /nd/, q /ŋg/ preserve related phonological contrasts",
        "scope": "Historical pathway is reconstructed; synchronic Fijian orthography is not a morpheme-by-morpheme sound-change rule.",
        "sources": [
          "F1",
          "F4"
        ]
      },
      {
        "name": "Branch-specific *p reflexes",
        "input": "Proto-Oceanic *p between vowels in selected cognates",
        "outcome": "some branches lose it; Bauan Fijian and other branches may retain different reflexes",
        "examples": "Takia loss is cited in comparison with Fijian v in related sets",
        "scope": "Shows why Oceanic outcomes must be branch- and environment-specific.",
        "sources": [
          "F2",
          "F7"
        ]
      }
    ]
  },
  "sources": [
    {
      "id": "F1",
      "label": "The Lexicon of Proto Oceanic, phonology and reconstruction method",
      "url": "https://tlopo.clld.org/contributions/5-1"
    },
    {
      "id": "F4",
      "label": "Albert J. Schütz, The Fijian Language, University of Hawai‘i Press",
      "url": "https://manifold.uhpress.hawaii.edu/projects/the-fijian-language"
    },
    {
      "id": "F7",
      "label": "ANU, History of Polynesian Phonology",
      "url": "https://openresearch-repository.anu.edu.au/server/api/core/bitstreams/b9abd711-705b-4b8c-b5a9-d314f8587bed/content"
    },
    {
      "id": "F8",
      "label": "ANU, Proto-Oceanic word *patu and Bauan Fijian vatu",
      "url": "https://tlopo.clld.org/contributions/1-4"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
