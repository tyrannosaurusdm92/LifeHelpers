// Extended historical-linguistics dataset. Dates and reconstructions are explicitly qualified.
const record = {
  "id": "proto-oceanic",
  "language": "Proto-Oceanic (POc; reconstructed ancestor, not a living language)",
  "kind": "script",
  "data": {
    "script": {
      "nativeScriptStatus": "none-known",
      "exampleType": "scholarly-transcription",
      "history": "Proto-Oceanic has no known native writing system or contemporary primary manuscript corpus. Its forms are written in modern scholarly notation, conventionally with an asterisk for reconstructed forms and orthographic symbols that represent phonemes rather than ancient glyphs. Descendant languages later adopted different writing systems, including missionary-era Latin orthographies; those cannot be projected onto POc.",
      "subscripts": "Subscript numerals sometimes distinguish reconstructed phonemes or archival lexical sets in scholarship; they are editorial notation, not native POc letters. Unicode has subscript digits such as ₂ (U+2082), but the choice of convention must be documented.",
      "diacritics": "Macrons, acute accents, glottal symbols, and IPA characters depend on the source’s transcription system. Store source forms exactly and distinguish phonemic reconstruction from phonetic notation; NFC may normalize combining forms but should not erase analytical distinctions.",
      "strokeNotes": "No historical stroke order exists for an unwritten reconstructed language. Latin/IPA glyph shapes and font rendering belong to the modern transcription system; starred forms are a notation convention for reconstruction.",
      "unicodeExamples": [
        {
          "text": "*patu",
          "points": [
            42,
            112,
            97,
            116,
            117
          ],
          "note": "Asterisk marks a reconstructed form; letters are Latin code points"
        },
        {
          "text": "ŋ",
          "points": [
            331
          ],
          "note": "Latin small letter eng, used in some linguistic notation"
        },
        {
          "text": "ā",
          "points": [
            257
          ],
          "note": "Latin a with macron, convention-dependent transcription"
        },
        {
          "text": "ʔ",
          "points": [
            660
          ],
          "note": "IPA glottal stop; notation is analytic"
        }
      ]
    },
    "unicode": {
      "system": "There is no Proto-Oceanic Unicode script block because POc is reconstructed, not a historically attested writing tradition. Researchers use Latin-based linguistic transcription and IPA; Unicode support depends on the notation chosen.",
      "examples": [
        [
          "*patu",
          [
            42,
            112,
            97,
            116,
            117
          ],
          "Asterisk marks a reconstructed form; letters are Latin code points"
        ],
        [
          "ŋ",
          [
            331
          ],
          "Latin small letter eng, used in some linguistic notation"
        ],
        [
          "ā",
          [
            257
          ],
          "Latin a with macron, convention-dependent transcription"
        ],
        [
          "ʔ",
          [
            660
          ],
          "IPA glottal stop; notation is analytic"
        ]
      ],
      "subscripts": "Subscript numerals sometimes distinguish reconstructed phonemes or archival lexical sets in scholarship; they are editorial notation, not native POc letters. Unicode has subscript digits such as ₂ (U+2082), but the choice of convention must be documented.",
      "diacritics": "Macrons, acute accents, glottal symbols, and IPA characters depend on the source’s transcription system. Store source forms exactly and distinguish phonemic reconstruction from phonetic notation; NFC may normalize combining forms but should not erase analytical distinctions.",
      "stroke": "No historical stroke order exists for an unwritten reconstructed language. Latin/IPA glyph shapes and font rendering belong to the modern transcription system; starred forms are a notation convention for reconstruction."
    }
  },
  "sources": [
    {
      "id": "P1",
      "label": "ANU Press, The Prehistory of Oceanic Languages: current view",
      "url": "https://press.anu.edu.au/downloads/press/p69411/mobile/ch03.html"
    },
    {
      "id": "P2",
      "label": "ANU Press, The Lexicon of Proto Oceanic",
      "url": "https://press.anu.edu.au/publications/lexicon-proto-oceanic"
    },
    {
      "id": "P3",
      "label": "The Lexicon of Proto Oceanic, phonology and reconstruction method",
      "url": "https://tlopo.clld.org/contributions/5-1"
    },
    {
      "id": "P4",
      "label": "ANU Press, Oceanic subgrouping hypotheses",
      "url": "https://press.anu.edu.au/downloads/press/p69411/mobile/ch02s03.html"
    },
    {
      "id": "P5",
      "label": "ANU Press, Oceanic subgroup and POc culture",
      "url": "https://press.anu.edu.au/downloads/press/p69411/mobile/ch03s02.html"
    },
    {
      "id": "P6",
      "label": "Journal of Language Evolution, best practices for dating language families",
      "url": "https://doi.org/10.1093/jole/lzz009"
    },
    {
      "id": "P7",
      "label": "TLOPO, POc *patu and Bauan Fijian vatu correspondence",
      "url": "https://tlopo.clld.org/contributions/1-4"
    },
    {
      "id": "P8",
      "label": "ANU Press, Lapita and linguistic prehistory",
      "url": "https://press.anu.edu.au/downloads/press/p69411/mobile/ch06s03.html"
    }
  ]
};
export default record;
