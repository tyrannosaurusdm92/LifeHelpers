import lineage from './lineage.js';
import chronology from './chronology.js';
import soundChanges from './sound-change.js';
import prosody from './prosody-syntax.js';
import orthography from './orthography.js';

const profile = {
  id: 'hebrew-history',
  language: 'Hebrew (Biblical through Modern)',
  category: 'Middle Eastern',
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
    "id": "hebrew-history",
    "language": "Hebrew (Biblical through Modern)",
    "category": "Middle Eastern",
    "family": [
      "Afro-Asiatic",
      "Semitic",
      "West Semitic",
      "Central Semitic",
      "Northwest Semitic",
      "Canaanite",
      "Hebrew"
    ],
    "age": "Canaanite evidence spans roughly 1550–1200 BCE; Hebrew becomes a distinct identifiable language around the Late Bronze / Iron Age transition, not at one exact year. The date of Canaanite evidence is not the birth date of Proto-Semitic or Modern Hebrew. Neighboring languages form a continuum, and Hebrew developed through ancient, post-biblical and modern stages.",
    "siblings": [
      "Phoenician",
      "Ammonite",
      "Moabite",
      "Edomite",
      "Aramaic (close Northwest Semitic relative, usually classified outside Canaanite)",
      "Ugaritic (Late Bronze Northwest Semitic; some references include it within Canaanite, while others draw a narrower boundary)"
    ],
    "timeline": [
      "c. 1550–1200 BCE: Canaanite languages are represented in Late Bronze evidence",
      "Late Bronze / Early Iron transition: Hebrew becomes an identifiable Canaanite language; boundaries are gradual",
      "Persian period onward: Aramaic-derived square script increasingly becomes the standard Hebrew script",
      "First millennium CE: Masoretic communities develop and transmit vowel-pointing and cantillation systems",
      "19th–20th c.: Modern spoken Hebrew revival and standardization"
    ],
    "script": {
      "history": "Hebrew script evolved from Phoenician-derived Paleo-Hebrew into the Aramaic-derived square script now used for Hebrew. The transition was gradual, not a one-time alphabet replacement; Paleo-Hebrew remained in some Second Temple settings. The consonantal alphabet has 22 core letters and five final-form variants for letters at word end. Matres lectionis provide some vowel cues, and Masoretic niqqud and cantillation marks were added later to represent a reading tradition. Modern prose is usually unpointed. Hebrew is written right-to-left; Unicode stores text in logical order and a bidi algorithm determines visual display.",
      "unicode": [
        "ב — U+05D1: bet",
        "ך — U+05DA: final kaf, separate code point",
        "ְ — U+05B0: sheva niqqud combining point",
        "ָ — U+05B8: qamats niqqud combining point",
        "שׁ — U+05E9 U+05C1: shin with combining shin dot"
      ],
      "subscripts": "Niqqud can appear below a consonant but are combining vowel points, not subscript letters; Hebrew has no native subscript letters.",
      "strokes": "Paleo-Hebrew and square letters have distinct historical strokes and shapes. Vowel points are later combining signs around consonants; final forms are separate letters. Unicode encodes text and combining marks, not handwriting paths."
    },
    "phonology": {
      "syllables": "Modern broad pattern (C)(C)V(C), with cluster restrictions; earlier stages had distinct vowel, length and gemination systems.",
      "changes": [
        "Canaanite shift: Hebrew šālōm vs. Arabic salām (A major correspondence with debated conditioning and chronology; not every a in every context changes.)",
        "Modern Hebrew consonant mergers and degemination: Klein documents mergers, loss of pharyngeals/glottals and reduced inventory (Variation by pronunciation tradition, community and speaker; not a single universal modern outcome.)",
        "Vowel history in Biblical Hebrew reading traditions: Tiberian Biblical Hebrew records the outcome of a later reading tradition (Reconstructed sound laws and chronology are debated; pointed spelling is not a direct audio transcript.)"
      ],
      "syntax": "Biblical verbal clauses often VSO; Modern Hebrew commonly SVO. Root-pattern morphology and construct state are central."
    },
    "unicodeNotes": "Keep logical RTL character order and combining marks. NFC/NFD may change code-point sequences; test mixed-direction punctuation and selection. Do not remove niqqud from pointed source text.",
    "sources": [
      [
        "Cambridge, Hebrew in The Ancient Languages of Syria-Palestine and Arabia",
        "https://www.cambridge.org/core/books/abs/ancient-languages-of-syriapalestine-and-arabia/hebrew/512F0FC4796BF3DB1137C1A9BA228DB1"
      ],
      [
        "University of Texas at Austin, The Canaanite Languages",
        "https://sites.utexas.edu/scripts/files/2020/10/2019-AWW-The-Canaanite-Languages.pdf"
      ],
      [
        "Mnamon, Hebrew writing systems",
        "https://mnamon.sns.it/index.php?id=8&lang=en&page=Scrittura"
      ],
      [
        "Bar-Ilan University, Paleo-Hebrew script history",
        "https://cris.biu.ac.il/ws/portalfiles/portal/55985668/3511_Article_Text_15900_1_10_20171121.pdf"
      ],
      [
        "Stav Klein, Notes on Modern Hebrew phonology and orthography",
        "https://cris.biu.ac.il/en/publications/notes-on-modern-hebrew-phonology-and-orthography/"
      ],
      [
        "Brill, The Development of the Biblical Hebrew Vowels",
        "https://brill.com/abstract/title/54039"
      ],
      [
        "Cambridge, A Guide to Biblical Hebrew Syntax",
        "https://www.cambridge.org/core/books/abs/guide-to-biblical-hebrew-syntax/introduction/6012AD08783DB503C31E1C34D9E22606"
      ],
      [
        "Oxford Academic, Biblical and Modern Hebrew verb-initial syntax",
        "https://academic.oup.com/book/48516/chapter-abstract/422193241"
      ],
      [
        "Unicode Consortium, Characters and Combining Marks FAQ",
        "https://www.unicode.org/faq/char_combmark.html"
      ],
      [
        "Unicode Standard Annex #15, Normalization Forms",
        "https://www.unicode.org/reports/tr15/"
      ],
      [
        "Unicode Hebrew chart",
        "https://www.unicode.org/charts/PDF/U0590.pdf"
      ],
      [
        "Unicode Consortium, Version 18.0.0 publication (2026-09-16)",
        "https://www.unicode.org/versions/Unicode18.0.0/"
      ]
    ],
    "routing_tags": [
      "Hebrew (Biblical through Modern)",
      "Middle Eastern",
      "language-history",
      "phonology",
      "script",
      "unicode"
    ]
  }
};
export { lineage, chronology, soundChanges, prosody, orthography };
export default profile;
