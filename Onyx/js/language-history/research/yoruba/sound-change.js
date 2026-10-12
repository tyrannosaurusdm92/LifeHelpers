// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "yoruba",
  "language": "Yoruba (standard orthography; dialect continuum)",
  "category": "African",
  "kind": "sound-change",
  "data": {
    "rules": [
      {
        "name": "Loanword cluster repair in traditional Yoruba",
        "input": "consonant clusters not licensed by traditional V/CV syllable patterns",
        "outcome": "often resolved by vowel epenthesis or consonant deletion",
        "examples": "contemporary analyses compare adapted loan strata such as búrẹ́dì and brẹ́dì",
        "scope": "Modern Yoruba has layered strata; some contemporary loans retain clusters/codas and hypercorrection occurs.",
        "sources": [
          "Y6"
        ]
      },
      {
        "name": "Tone marking by syllable",
        "input": "lexical and grammatical tone in a syllable-based prosodic system",
        "outcome": "high acute, low grave, mid often unmarked in standard orthography",
        "examples": "tone restoration performs better when syllables, rather than isolated characters, are modeled",
        "scope": "Tone realization and marking vary by word, dialect and editorial convention.",
        "sources": [
          "Y5",
          "Y6"
        ]
      },
      {
        "name": "Comparative Yoruboid correspondences",
        "input": "cognate forms across Yoruba, Itsekiri and Igala",
        "outcome": "reconstructed proto-segments and subgroup distinctions",
        "examples": "Akinkugbe’s comparative phonology treats the three groups comparatively",
        "scope": "A correspondence set must be checked in the cited reconstruction; this module does not invent a general proto-to-modern substitution.",
        "sources": [
          "Y4"
        ]
      }
    ]
  },
  "sources": [
    {
      "id": "Y4",
      "label": "Akinkugbe, An Internal Classification of Yoruboid",
      "url": "https://journalofwestafricanlanguages.org/downloads/summary/31-volume1101/131-an-internal-classification-of-the-yoruboid-group-yoruba-isekiri-igala"
    },
    {
      "id": "Y6",
      "label": "Cambridge, Emerging Grammars in Contemporary Yoruba Phonology",
      "url": "https://www.cambridge.org/core/journals/canadian-journal-of-linguistics-revue-canadienne-de-linguistique/article/emerging-grammars-in-contemporary-yoruba-phonology/5FBC31A5B98304BD5F4F398569D75854"
    },
    {
      "id": "Y8",
      "label": "University of Georgia, Yoruba phonology, syllable structure and tone",
      "url": "https://africa.uga.edu/Yoruba/phonology.html"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
