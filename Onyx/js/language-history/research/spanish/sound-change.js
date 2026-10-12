// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "spanish",
  "language": "Spanish",
  "category": "Romance",
  "kind": "sound-change",
  "data": {
    "rules": [
      {
        "name": "Stressed-vowel diphthongization",
        "input": "Latin stressed short /ɛ, ɔ/ in inherited lexical items",
        "outcome": "often /je, we/ in Spanish",
        "examples": "terra → tierra; porta → puerta",
        "scope": "Conditioned by stress and historical/lexical environment; exceptions exist.",
        "sources": [
          "S2",
          "S3"
        ]
      },
      {
        "name": "Initial Latin f weakening",
        "input": "Latin word-initial /f/ before a vowel in relevant Castilian inherited words",
        "outcome": "medieval aspiration written h, later usually zero in standard Spanish",
        "examples": "farina → harina; filium → hijo",
        "scope": "Regional and lexical; clusters, learned forms and later loans often retain f.",
        "sources": [
          "S2",
          "S8"
        ]
      },
      {
        "name": "Intervocalic stop voicing / lenition",
        "input": "inherited Latin voiceless stops between vowels",
        "outcome": "often voiced; voiced stops are commonly approximants in modern Spanish environments",
        "examples": "vita → vida",
        "scope": "Not all tokens are inherited or regular in the same way; phonetic realization varies.",
        "sources": [
          "S2"
        ]
      }
    ]
  },
  "sources": [
    {
      "id": "S2",
      "label": "Oxford, From Latin to Romance in Sound Charts",
      "url": "https://academic.oup.com/book/26021"
    },
    {
      "id": "S8",
      "label": "Cambridge, Spanish f > h historical phonology study",
      "url": "https://revistas.ucm.es/index.php/RFRM/es/article/view/71878"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
