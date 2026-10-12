// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "hebrew",
  "language": "Hebrew (Biblical through Modern)",
  "category": "Middle Eastern",
  "kind": "sound-change",
  "data": {
    "rules": [
      {
        "name": "Canaanite shift",
        "input": "Proto-Northwest-Semitic long *ā in relevant inherited forms",
        "outcome": "Canaanite *ō",
        "examples": "Hebrew šālōm vs. Arabic salām",
        "scope": "A major correspondence with debated conditioning and chronology; not every a in every context changes.",
        "sources": [
          "H1",
          "H6"
        ]
      },
      {
        "name": "Modern Hebrew consonant mergers and degemination",
        "input": "contrasts of earlier Hebrew stages, including historical gutturals, emphatics and geminates",
        "outcome": "partial/full mergers and degemination in many Modern Hebrew pronunciations",
        "examples": "Klein documents mergers, loss of pharyngeals/glottals and reduced inventory",
        "scope": "Variation by pronunciation tradition, community and speaker; not a single universal modern outcome.",
        "sources": [
          "H5"
        ]
      },
      {
        "name": "Vowel history in Biblical Hebrew reading traditions",
        "input": "Proto-Northwest-Semitic vowel contrasts",
        "outcome": "lengthening, reduction, diphthong contraction, apocope and related changes",
        "examples": "Tiberian Biblical Hebrew records the outcome of a later reading tradition",
        "scope": "Reconstructed sound laws and chronology are debated; pointed spelling is not a direct audio transcript.",
        "sources": [
          "H6"
        ]
      }
    ]
  },
  "sources": [
    {
      "id": "H1",
      "label": "Cambridge, Hebrew in The Ancient Languages of Syria-Palestine and Arabia",
      "url": "https://www.cambridge.org/core/books/abs/ancient-languages-of-syriapalestine-and-arabia/hebrew/512F0FC4796BF3DB1137C1A9BA228DB1"
    },
    {
      "id": "H5",
      "label": "Stav Klein, Notes on Modern Hebrew phonology and orthography",
      "url": "https://cris.biu.ac.il/en/publications/notes-on-modern-hebrew-phonology-and-orthography/"
    },
    {
      "id": "H6",
      "label": "Brill, The Development of the Biblical Hebrew Vowels",
      "url": "https://brill.com/abstract/title/54039"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
