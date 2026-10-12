import lineage from './lineage.js';
import chronology from './chronology.js';
import soundChanges from './sound-change.js';
import prosody from './prosody-syntax.js';
import orthography from './orthography.js';

const profile = {
  id: 'spanish-history',
  language: 'Spanish',
  category: 'Romance',
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
    "id": "spanish-history",
    "language": "Spanish",
    "category": "Romance",
    "family": [
      "Indo-European",
      "Italic",
      "Latin",
      "Romance",
      "Ibero-Romance",
      "Castilian / Spanish"
    ],
    "age": "Latin inscriptions survive from the seventh–sixth centuries BCE; some individual early inscriptions have contested dating or language attribution. This is the age of an ancestor and written record, not the birth date of Spanish. Spoken Latin diversified regionally over centuries; Spanish is a medieval Romance language.",
    "siblings": [
      "Portuguese and Galician",
      "Astur-Leonese",
      "Aragonese",
      "Catalan (its position within Romance classifications is described differently)",
      "French",
      "Italian",
      "Sardinian",
      "Romanian"
    ],
    "timeline": [
      "7th–6th c. BCE: Archaic Latin inscriptions are attested",
      "1st millennium CE: Regional spoken Latin differentiates into Romance varieties over centuries",
      "Medieval period: Early Romance and Castilian writing becomes visible in surviving records",
      "1492 onward: Grammar, print, administration and imperial expansion help codify and extend Spanish"
    ],
    "script": {
      "history": "Spanish uses the Latin alphabet, whose Roman forms developed through earlier Greek and Etruscan writing traditions and later changed through monumental capitals, cursive hands, medieval book scripts, printing and modern type. These are changes in glyph design and writing practice; Unicode encodes abstract text characters, not the pen path, pressure, stroke order or historical allograph. In medieval manuscripts, a small superscript n used as an abbreviation for a doubled n contributed to the development of ñ. Modern Spanish treats ñ as a separate alphabet letter, whereas ch and ll are digraphs. Acute accents mark stress or contrasts according to spelling rules; ü indicates that u is pronounced in güe/güi. The inverted question and exclamation marks are punctuation.",
      "unicode": [
        "ñ — U+00F1: Spanish letter eñe; NFC example",
        "ñ — U+006E U+0303: NFD sequence rendering the same grapheme",
        "á — U+00E1: acute-accented a",
        "é — U+00E9: acute-accented e",
        "í — U+00ED: acute-accented i",
        "ó — U+00F3: acute-accented o",
        "ú — U+00FA: acute-accented u",
        "ü — U+00FC: u with diaeresis in güe/güi",
        "¿ — U+00BF: inverted question mark",
        "¡ — U+00A1: inverted exclamation mark",
        "́ — U+0301: combining acute accent in decomposed text",
        "̃ — U+0303: combining tilde in decomposed ñ"
      ],
      "subscripts": "No native subscript letters in the standard orthography. Linguistic subscripts in IPA or metadata belong to a separate notation layer.",
      "strokes": "Letterforms and writing tools change the visible stroke shape; the ñ tilde descends from an abbreviation mark over n in medieval practice. Unicode stores text values, not handwriting trajectories."
    },
    "phonology": {
      "syllables": "Broad template (C)(C)V(C); five oral vowels; stress and vowel sequence analysis are orthography- and dialect-sensitive.",
      "changes": [
        "Stressed-vowel diphthongization: terra → tierra; porta → puerta (Conditioned by stress and historical/lexical environment; exceptions exist.)",
        "Initial Latin f weakening: farina → harina; filium → hijo (Regional and lexical; clusters, learned forms and later loans often retain f.)",
        "Intervocalic stop voicing / lenition: vita → vida (Not all tokens are inherited or regular in the same way; phonetic realization varies.)"
      ],
      "syntax": "Neutral SVO is common; flexible constituent order, null subjects, verb agreement, clitics and focus are central."
    },
    "unicodeNotes": "Preserve accents, ñ, ü and punctuation. Normalize at a system boundary, usually NFC for storage/display interoperability; never strip marks from canonical text.",
    "sources": [
      [
        "Cambridge, The Indo-European Language Family: Italic",
        "https://www.cambridge.org/core/books/indoeuropean-language-family/italic/473A395FABB6E9FB91AE75076F390D29"
      ],
      [
        "Oxford, From Latin to Romance in Sound Charts",
        "https://academic.oup.com/book/26021"
      ],
      [
        "Cambridge Handbook of Spanish Linguistics, The Syllable",
        "https://www.cambridge.org/core/books/abs/cambridge-handbook-of-spanish-linguistics/syllable/CB48DEE6ECF4EAD91E816486BA8E8573"
      ],
      [
        "RAE-ASALE, Ortografía básica: vowel sequences and written accents",
        "https://www.rae.es/ortograf%C3%ADa-b%C3%A1sica/uso-de-la-tilde/las-reglas-de-acentuaci%C3%B3n-gr%C3%A1fica/la-acentuaci%C3%B3n-gr%C3%A1fica-de-las-palabras-con-secuencias-voc%C3%A1licas"
      ],
      [
        "RAE-ASALE, Diccionario panhispánico de dudas: u and diéresis",
        "https://www.rae.es/dpd/u"
      ],
      [
        "Cambridge, Latin Script in Antiquity",
        "https://www.cambridge.org/core/books/abs/latin-palaeography/latin-script-in-antiquity/7AAE013BCD262AB689DE4B2FAAD02B0D"
      ],
      [
        "FundéuRAE, medieval origin of ñ",
        "https://www.fundeu.es/noticia/cual-es-el-origen-de-la-letra-n-y-que-otras-lenguas-la-utilizan/"
      ],
      [
        "Cambridge, Spanish f > h historical phonology study",
        "https://revistas.ucm.es/index.php/RFRM/es/article/view/71878"
      ],
      [
        "Cambridge Handbook of Spanish Linguistics, syntax, null subjects and word order",
        "https://www.cambridge.org/core/books/abs/cambridge-handbook-of-spanish-linguistics/syntax-and-its-interfaces/34F6C81447F7F97188847E3740EDEF49"
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
      "Spanish",
      "Romance",
      "language-history",
      "phonology",
      "script",
      "unicode"
    ]
  }
};
export { lineage, chronology, soundChanges, prosody, orthography };
export default profile;
