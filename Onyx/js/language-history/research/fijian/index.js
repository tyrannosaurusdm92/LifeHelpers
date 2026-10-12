import lineage from './lineage.js';
import chronology from './chronology.js';
import soundChanges from './sound-change.js';
import prosody from './prosody-syntax.js';
import orthography from './orthography.js';

const profile = {
  id: 'fijian-history',
  language: 'Fijian (standard, Bauan-influenced)',
  category: 'Oceanic',
  family: lineage.data.familyTree,
  rootEvidence: lineage.data.root,
  siblings: lineage.data.siblings,
  lineage: { ...lineage.data, sources: lineage.sources },
  chronology: { ...chronology.data, sources: chronology.sources },
  soundChanges: { ...soundChanges.data, sources: soundChanges.sources },
  prosodyAndSyntax: { ...prosody.data, sources: prosody.sources },
  orthography: { ...orthography.data, sources: orthography.sources },
  sources: [...lineage.sources, ...chronology.sources, ...soundChanges.sources, ...prosody.sources, ...orthography.sources],
  legacy: {
    "id": "fijian-history",
    "language": "Fijian (standard, Bauan-influenced)",
    "category": "Oceanic",
    "family": [
      "Austronesian",
      "Malayo-Polynesian",
      "Oceanic",
      "Central Pacific",
      "Fijian varieties",
      "Standard Fijian"
    ],
    "age": "Proto-Oceanic is calibrated at about 3,000–3,300 years before present (BP, using the 1950 CE baseline standard in archaeology) in archaeological-language dating work; Central Pacific differentiation is later. These are modeled dates for reconstructed ancestors, not written attestations. Fiji was an important diversification area; Fijian varieties and Polynesian languages descend through later Central Pacific history.",
    "siblings": [
      "Eastern and Western Fijian varieties",
      "Polynesian languages through Proto-Polynesian (including Tongan, Samoan, Māori and others)",
      "Rotuman (placement and history require care; do not call it an uncontested direct sibling)"
    ],
    "timeline": [
      "c. 3,000–3,300 BP (1950 CE baseline): Proto-Oceanic dispersal is used as an archaeological calibration",
      "Later prehistory: Proto-Central Pacific diversifies in and around Fiji into regional lineages",
      "Late 1830s onward: Missionary printing and translation establish Latin spelling conventions"
    ],
    "script": {
      "history": "The standard Fijian writing system is Latin-based and was shaped by 19th-century missionary spelling and printing, with Bauan influence. Its design is economical: b, d and q encode prenasalized stops, g encodes the velar nasal, c the voiced interdental fricative, and dr is conventionally written with two Latin letters for a special consonant. The odd-looking values are stable parts of the orthography, not typographical mistakes. Fijian does not have a separate ancient indigenous alphabet that this modern Latin spelling replaced; written history must be distinguished from the much older oral language.",
      "unicode": [
        "b — U+0062: standard Fijian grapheme commonly /mb/",
        "d — U+0064: standard Fijian grapheme commonly /nd/",
        "q — U+0071: standard Fijian grapheme commonly /ŋg/",
        "c — U+0063: standard Fijian grapheme /ð/",
        "dr — U+0064 U+0072: two code points; one special orthographic sequence"
      ],
      "subscripts": "No native subscript letters in standard Fijian spelling.",
      "strokes": "Letter values were chosen within Latin type and printing constraints. The printed glyph is not a phonetic description: b/d/q encode prenasalized sounds; c/g have non-English values. Unicode does not encode stroke order."
    },
    "phonology": {
      "syllables": "Open V/CV syllables; five vowels; primary stress targets the penultimate mora (often penultimate syllable, but final if heavy); consonant letter sequences do not map one-to-one to phoneme count.",
      "changes": [
        "Inherited *p correspondence: *patu → vatu (A comparative correspondence in a cited cognate set; not a blanket rewrite of all p or v.)",
        "Prenasalized stop formation in Proto-Oceanic: standard Fijian orthographic b /mb/, d /nd/, q /ŋg/ preserve related phonological contrasts (Historical pathway is reconstructed; synchronic Fijian orthography is not a morpheme-by-morpheme sound-change rule.)",
        "Branch-specific *p reflexes: Takia loss is cited in comparison with Fijian v in related sets (Shows why Oceanic outcomes must be branch- and environment-specific.)"
      ],
      "syntax": "Transitive clauses are often VOS/verb-initial; argument marking and discourse permit other orders."
    },
    "unicodeNotes": "Use NFC for ordinary storage. Keep standard spelling distinct from IPA and scholarly macron conventions; do not remove marks from cited transcriptions.",
    "sources": [
      [
        "The Lexicon of Proto Oceanic, phonology and reconstruction method",
        "https://tlopo.clld.org/contributions/5-1"
      ],
      [
        "ANU Press, The Prehistory of Oceanic Languages",
        "https://press.anu.edu.au/downloads/press/p69411/mobile/ch03.html"
      ],
      [
        "Journal of Language Evolution, best practices for dating language families",
        "https://doi.org/10.1093/jole/lzz009"
      ],
      [
        "Albert J. Schütz, The Fijian Language, University of Hawai‘i Press",
        "https://manifold.uhpress.hawaii.edu/projects/the-fijian-language"
      ],
      [
        "Grammatical Forms in Eastern and Western Fijian, phonology and order",
        "https://doi.org/10.1163/9789004762077-014"
      ],
      [
        "Cambridge Museum of Archaeology and Anthropology, Fiji missionaries",
        "https://maa.cam.ac.uk/Fiji-missionaries"
      ],
      [
        "ANU, History of Polynesian Phonology",
        "https://openresearch-repository.anu.edu.au/server/api/core/bitstreams/b9abd711-705b-4b8c-b5a9-d314f8587bed/content"
      ],
      [
        "ANU, Proto-Oceanic word *patu and Bauan Fijian vatu",
        "https://tlopo.clld.org/contributions/1-4"
      ],
      [
        "Kenstowicz, Salience and similarity in loanword adaptation: Fijian moraic stress",
        "https://www.sciencedirect.com/science/article/abs/pii/S0388000106000933"
      ],
      [
        "Unicode Consortium, Characters and Combining Marks FAQ",
        "https://www.unicode.org/faq/char_combmark.html"
      ],
      [
        "Unicode Standard Annex #15, Normalization Forms",
        "https://www.unicode.org/reports/tr15/"
      ]
    ],
    "routing_tags": [
      "Fijian (standard, Bauan-influenced)",
      "Oceanic",
      "language-history",
      "phonology",
      "script",
      "unicode"
    ]
  }
};
export { lineage, chronology, soundChanges, prosody, orthography };
export default profile;
