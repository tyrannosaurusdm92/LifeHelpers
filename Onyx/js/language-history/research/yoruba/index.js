import lineage from './lineage.js';
import chronology from './chronology.js';
import soundChanges from './sound-change.js';
import prosody from './prosody-syntax.js';
import orthography from './orthography.js';

const profile = {
  id: 'yoruba-history',
  language: 'Yoruba (standard orthography; dialect continuum)',
  category: 'African',
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
    "id": "yoruba-history",
    "language": "Yoruba (standard orthography; dialect continuum)",
    "category": "African",
    "family": [
      "Niger-Congo (classification contested at highest levels)",
      "Volta-Niger / Benue-Congo groupings vary",
      "Yoruboid",
      "Edekiri / Yoruba varieties"
    ],
    "age": "A Cambridge overview places Niger-Congo expansion near 12,000 BP; a Language Science Press overview describes Niger-Congo as a macrofamily or phylum at least 12 millennia old while emphasizing incomplete reconstruction and uneven evidence. For the closer Yoruba lineage, Ogundiran’s interdisciplinary model places Proto-Yoruboid development in a broad 2500–300 BCE period, with daughter differentiation by about 300 CE; that window runs from roughly 4,500 to 2,300 BP. The roughly 12,000 BP value is a broad family-expansion estimate, not a securely reconstructed point date for Proto-Niger-Congo. Only the early part of the Proto-Yoruboid window exceeds 2,500 years. These distinct claims should not be collapsed into a precise date for Yoruba.",
    "siblings": [
      "Igala",
      "Itsekiri / Iṣẹkiri",
      "Yoruba varieties including Ọ̀yọ́, Èkìtì, Ìjẹ̀bú and Ìjẹ̀ṣà",
      "Other Edekiri varieties (subgroup labels vary)"
    ],
    "timeline": [
      "About 12,000 BP (broad literature estimate): Niger-Congo expansion and macrofamily time depth are placed near or above this age in two scholarly overviews; internal classification and full proto-language reconstruction remain debated",
      "Broadly 2500–300 BCE in one model: Proto-Yoruboid develops around the Niger–Benue confluence in Ogundiran’s interdisciplinary periodization",
      "By c. 300 CE in the same model: Proto-Igala, Proto-Itsekiri and Proto-Yoruba differentiate",
      "19th c.: Missionary-era Latin orthography and literacy spread; Arabic Ajami is also used in some communities",
      "1974 and later reviews: A standard orthography is established and later conventions remain debated"
    ],
    "script": {
      "history": "Yoruba is written primarily in an adapted Latin alphabet. Standard letters Ẹ/ẹ, Ọ/ọ and Ṣ/ṣ distinguish sounds; tone marks above vowels and syllabic nasals indicate high (acute) and low (grave), while mid tone is often unmarked or shown with a macron for disambiguation. The underdot is a below-base diacritic that identifies a different letter value; it is not a subscript letter. A tone mark and an underdot can occur on the same vowel, so rendering needs a font with correct stacking. Some communities have used Arabic Ajami, but there is no single uniform Ajami standard for all Yoruba text.",
      "unicode": [
        "Ẹ — U+1EB8: capital E with dot below",
        "ẹ — U+1EB9: small e with dot below",
        "Ṣ — U+1E62: capital S with dot below",
        "ṣ — U+1E63: small s with dot below",
        "ẹ́ — U+1EB9 U+0301: precomposed underdotted e plus combining acute",
        "ẹ́ — U+0065 U+0323 U+0301: decomposed base, dot below, acute; normalize carefully",
        "ń — U+0144: small n with acute; high tone on a syllabic nasal",
        "ǹ — U+01F9: small n with grave; low tone on a syllabic nasal",
        "n̄ — U+006E U+0304: n plus combining macron; mid tone may be marked to disambiguate",
        "ǎ — U+0061 U+030C: base a plus combining caron, shown only as a proposed contour-tone notation"
      ],
      "subscripts": "Underdots are combining diacritics, not subscript letters. No native subscript letters in standard Yoruba orthography.",
      "strokes": "Underdots and stacked tone marks change the letter/grapheme distinction. Handwritten dots, printed marks and font placement vary; Unicode records code points and combining behavior, not physical stroke order. A 2026 proposal uses caron/circumflex for contour tones, but that is not the 1974 standard."
    },
    "phonology": {
      "syllables": "Traditional V/CV plus syllabic nasal; tone-bearing syllables; contemporary contact has expanded some loanword strata with clusters and codas.",
      "changes": [
        "Loanword cluster repair in traditional Yoruba: contemporary analyses compare adapted loan strata such as búrẹ́dì and brẹ́dì (Modern Yoruba has layered strata; some contemporary loans retain clusters/codas and hypercorrection occurs.)",
        "Tone marking by syllable: tone restoration performs better when syllables, rather than isolated characters, are modeled (Tone realization and marking vary by word, dialect and editorial convention.)",
        "Comparative Yoruboid correspondences: Akinkugbe’s comparative phonology treats the three groups comparatively (A correspondence set must be checked in the cited reconstruction; this module does not invent a general proto-to-modern substitution.)"
      ],
      "syntax": "Broadly SVO with preverbal grammatical markers, serial verbs, tone and information-structure effects."
    },
    "unicodeNotes": "Support both precomposed and combining sequences; NFC is convenient, but compare normalized grapheme sequences. Never drop underdots or tone marks from canonical Yoruba text.",
    "sources": [
      [
        "Akinwumi Ogundiran, The Yoruba: A New History",
        "https://iupress.org/9780253051486/the-yoruba/"
      ],
      [
        "Cambridge, The Yoruba from Prehistory to the Present: Geography and Society",
        "https://www.cambridge.org/core/books/yoruba-from-prehistory-to-the-present/geography-and-society/CC682B3D24A7A9648C018BABC1E2EDEA"
      ],
      [
        "Oxford Handbook Topics in Linguistics, Niger-Congo classification review",
        "https://academic.oup.com/edited-volume/42051/chapter/355823946"
      ],
      [
        "Akinkugbe, An Internal Classification of Yoruboid",
        "https://journalofwestafricanlanguages.org/downloads/summary/31-volume1101/131-an-internal-classification-of-the-yoruboid-group-yoruba-isekiri-igala"
      ],
      [
        "Yoruba tone-mark restoration study",
        "https://journals.agh.edu.pl/csci/article/view/2128"
      ],
      [
        "Cambridge, Emerging Grammars in Contemporary Yoruba Phonology",
        "https://www.cambridge.org/core/journals/canadian-journal-of-linguistics-revue-canadienne-de-linguistique/article/emerging-grammars-in-contemporary-yoruba-phonology/5FBC31A5B98304BD5F4F398569D75854"
      ],
      [
        "Yoruba Writing: Standards and Trends",
        "https://www.theartsjournal.org/index.php/site/article/view/50"
      ],
      [
        "University of Georgia, Yoruba phonology, syllable structure and tone",
        "https://africa.uga.edu/Yoruba/phonology.html"
      ],
      [
        "Oxford Scholarship Online, Yoruba orthography and the 1974 standard",
        "https://academic.oup.com/princeton-scholarship-online/book/60415/chapter-abstract/520979142"
      ],
      [
        "Tubosun, Marking Contour Tones in Yorùbá (2026 preprint)",
        "https://arxiv.org/abs/2609.38627"
      ],
      [
        "Tubosun et al., ÌròyìnSpeech tone-marked Yorùbá corpus and normalization (2026 preprint)",
        "https://arxiv.org/abs/2610.05366"
      ],
      [
        "University of Georgia, Yoruba grammar and basic SVO order",
        "https://africa.uga.edu/Yoruba/grammar.html"
      ],
      [
        "Jeff Good, Niger-Congo languages, Cambridge Handbook of Areal Linguistics (2017)",
        "https://doi.org/10.1017/9781107279872.018"
      ],
      [
        "Vydrin, East Benue-Congo preface on the Niger-Congo macrofamily and reconstruction (Language Science Press)",
        "https://langsci-press.org/catalog/view/190/1074/1266-2"
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
        "Unicode Latin Extended Additional chart",
        "https://www.unicode.org/charts/PDF/U1E00.pdf"
      ]
    ],
    "routing_tags": [
      "Yoruba (standard orthography; dialect continuum)",
      "African",
      "language-history",
      "phonology",
      "script",
      "unicode"
    ]
  }
};
export { lineage, chronology, soundChanges, prosody, orthography };
export default profile;
