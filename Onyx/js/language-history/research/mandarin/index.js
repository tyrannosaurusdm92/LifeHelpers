import lineage from './lineage.js';
import chronology from './chronology.js';
import soundChanges from './sound-change.js';
import prosody from './prosody-syntax.js';
import orthography from './orthography.js';

const profile = {
  id: 'mandarin-history',
  language: 'Mandarin Chinese (Standard Mandarin focus)',
  category: 'Asian / Sinitic',
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
    "id": "mandarin-history",
    "language": "Mandarin Chinese (Standard Mandarin focus)",
    "category": "Asian / Sinitic",
    "family": [
      "Sino-Tibetan",
      "Sinitic",
      "Mandarin",
      "Standard Mandarin"
    ],
    "age": "Bayesian phylogenetic studies estimate initial Sino-Tibetan divergence at 5,871 BP and 7,184 BP in two 2019 studies; a broader 131-language study estimated a mean root age of 7,983 BP (95% highest posterior density interval 4,778–11,285 BP). BP uses the 1950 baseline. These modeled family ages are not dates for the Sinitic split, Old Chinese writing, or Mandarin. Late Shang oracle-bone records independently attest written Old Chinese in the 13th–11th centuries BCE. The models support an ancestor older than 2,500–3,500 years, but they do not date Mandarin or the Sinitic branch directly. Sino-Tibetan internal classification and the Sinitic/non-Sinitic branching model remain debated. Oracle-bone writing dates an artifact record, not spoken language origin.",
    "siblings": [
      "Jin (sometimes grouped with or near Mandarin)",
      "Wu",
      "Gan",
      "Xiang",
      "Hakka",
      "Yue",
      "Min",
      "Hui",
      "Pinghua (inventories vary by classification)",
      "Tibetic (wider-family comparison)",
      "Burmese (wider-family comparison)",
      "Karenic (wider-family comparison)",
      "Lolo-Burmese and Himalayan languages (wider-family comparisons; subgroup relations are debated)"
    ],
    "timeline": [
      "Published models: 5,871–7,983 BP (with wider credible intervals): Bayesian lexical phylogenies estimate the initial Sino-Tibetan divergence; one 2020 study reports a 95% HPD interval of 4,778–11,285 BP",
      "13th–11th c. BCE: Late Shang oracle-bone inscriptions attest early written Chinese",
      "Pre-Qin period: Old Chinese is reconstructed from rhyme, character phonetics and later evidence",
      "601 CE: Qieyun rhyme tradition supplies a major Middle Chinese reference point",
      "1324 CE: Zhongyuan Yinyun documents a system termed Old Mandarin",
      "28 January 1956: State Council approves the Scheme for Simplifying Chinese Characters",
      "1958 CE: PRC adopts Hanyu Pinyin as a Romanization scheme"
    ],
    "script": {
      "history": "Chinese writing has continuous use across more than three millennia, with major material and calligraphic forms including oracle-bone, bronze, seal, clerical, cursive, running and regular script. Early incised characters often have angular strokes suited to bone or metal; seal forms favor balanced, even lines; clerical writing develops prominent horizontal and descending strokes; brush-based cursive can omit or join strokes. These are histories of glyph shape and writing technique, not a single standardized stroke order for every historical object. Modern Unicode Han characters encode unified abstract ideographs; a font selects a glyph form, and regional variants can differ visibly.",
      "unicode": [
        "好 — U+597D: CJK Unified Ideograph; character is not an alphabetic pronunciation spelling",
        "ā — U+0101: Pinyin a, first tone",
        "á — U+00E1: Pinyin a, second tone",
        "ǎ — U+01CE: Pinyin a, third tone",
        "à — U+00E0: Pinyin a, fourth tone",
        "ē — U+0113: Pinyin e, first tone",
        "ě — U+011B: Pinyin e, third tone",
        "ī — U+012B: Pinyin i, first tone",
        "ǐ — U+01D0: Pinyin i, third tone",
        "ō — U+014D: Pinyin o, first tone",
        "ǒ — U+01D2: Pinyin o, third tone",
        "ū — U+016B: Pinyin u, first tone",
        "ǔ — U+01D4: Pinyin u, third tone",
        "ü — U+00FC: Pinyin u with diaeresis",
        "ǖ — U+01D6: Pinyin ü, first tone",
        "ǘ — U+01D8: Pinyin ü, second tone",
        "ǚ — U+01DA: Pinyin ü, third tone",
        "ǜ — U+01DC: Pinyin ü, fourth tone",
        "́ — U+0301: combining acute, second tone",
        "̌ — U+030C: combining caron, third tone",
        "̀ — U+0300: combining grave, fourth tone",
        "̄ — U+0304: combining macron, first tone",
        "ǔ — U+0075 U+030C: decomposed u plus combining caron; diaeresis may add U+0308"
      ],
      "subscripts": "No native subscript letters in Mandarin Han writing or Hanyu Pinyin. Linguistic reconstruction notation is separate.",
      "strokes": "Incision, seal cutting and brush movement produce different visible strokes. Running and cursive can join or omit strokes. The 1956 reform codified a set of simplified forms; later standards and regional practice affect which forms are in use. Unicode encodes characters, not the physical stroke sequence; glyph forms vary by font and region."
    },
    "phonology": {
      "syllables": "Approximate modern Standard Mandarin pattern (C)(G)V(X), restricted nasal endings, lexical tones plus neutral tone; historical Old Chinese was different.",
      "changes": [
        "Loss of entering-tone stop codas in Mandarin: Middle Chinese “entering tone” category no longer exists as a final-stop category in Standard Mandarin (Historical outcomes depend on initial class, dialect and tone history; not a single tone mapping.)",
        "Onset-voicing-conditioned tone/register splits: historical tone categories do not map uniformly across Mandarin and non-Mandarin branches (Branch-specific; the short record stores the conditioning relation, not a complete tone correspondence table.)",
        "Old Mandarin rhyme-system reorganization: the rhyme book describes Old Mandarin and shares core traits with Modern Mandarin (The book reflects a standard/composite phonological system and earlier northern innovations.)"
      ],
      "syntax": "Standard Mandarin is broadly SVO and topic-comment; aspect particles, classifiers, coverbs and complements are central."
    },
    "unicodeNotes": "Preserve Pinyin tone and ü distinctions. Use NFC/NFD consistently for text matching; do not strip tone marks or treat a Han character code point as its pronunciation.",
    "sources": [
      [
        "Smithsonian National Museum of Asian Art, oracle-bone object",
        "https://asia.si.edu/education/educator-resources/teaching-china-with-the-smithsonian/explore-by-object/inscribed-tortoise-shell-oracle-bone/"
      ],
      [
        "Oxford Handbook of Chinese Linguistics, Sinitic classification",
        "https://academic.oup.com/edited-volume/38607/chapter-abstract/334718815"
      ],
      [
        "Cambridge, An Introduction to Chinese Historical Phonology",
        "https://www.cambridge.org/core/books/abs/phonological-history-of-chinese/an-introduction-to-chinese-historical-phonology/7A1DECBDCB0C27F0486F3409A697D592"
      ],
      [
        "Cambridge, Old Mandarin and Zhongyuan Yinyun",
        "https://www.cambridge.org/core/books/abs/phonological-history-of-chinese/old-mandarin-the-zhongyuan-yinyun/25E3AB35BFBE15663813AA730A0F09EC"
      ],
      [
        "Oxford Academic, Sinitic historical and typological overview",
        "https://academic.oup.com/book/38951/chapter-abstract/338155819"
      ],
      [
        "Ministry of Education of the PRC, 1958 Pinyin scheme",
        "https://www.moe.gov.cn/jyb_sjzl/ziliao/A19/195802/t19580201_186000.html"
      ],
      [
        "Smithsonian National Museum of Asian Art, Chinese character styles",
        "https://asia-archive.si.edu/learn/chinas-calligraphic-arts/"
      ],
      [
        "Smithsonian, Understanding Chinese Characters",
        "https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/lesson-plans/understanding-chinese-characters/"
      ],
      [
        "Unicode CJK Unified Ideographs chart",
        "https://www.unicode.org/charts/PDF/U4E00.pdf"
      ],
      [
        "Cambridge Handbook of Chinese Linguistics, SVO as canonical word order",
        "https://www.cambridge.org/core/books/abs/cambridge-handbook-of-chinese-linguistics/svo-as-the-canonical-word-order-in-modern-chinese/30D40DBB3B92162A3A4B6313015B3CA9"
      ],
      [
        "Zhang et al., Dated phylogeny suggests early Neolithic origin of Sino-Tibetan languages (2020)",
        "https://www.nature.com/articles/s41598-020-77404-4"
      ],
      [
        "Zhang et al., Phylogenetic evidence for Sino-Tibetan origin in northern China in the Late Neolithic (2019)",
        "https://www.nature.com/articles/s41586-019-1153-z"
      ],
      [
        "Sagart et al., Dated language phylogenies shed light on the ancestry of Sino-Tibetan (2019; PMC full text)",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC6534992/"
      ],
      [
        "PRC Ministry of Education, State Council 1956 resolution on the Chinese Character Simplification Scheme",
        "https://www.moe.gov.cn/jyb_xwfb/xw_fbh/moe_2128/moe_2326/moe_1144/tnull_14350.html"
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
        "Unicode Standard, Chapter 18: East Asia",
        "https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-18/"
      ],
      [
        "Unicode Consortium, Version 18.0.0 publication (2026-09-16)",
        "https://www.unicode.org/versions/Unicode18.0.0/"
      ]
    ],
    "routing_tags": [
      "Mandarin Chinese (Standard Mandarin focus)",
      "Asian / Sinitic",
      "language-history",
      "phonology",
      "script",
      "unicode"
    ]
  }
};
export { lineage, chronology, soundChanges, prosody, orthography };
export default profile;
