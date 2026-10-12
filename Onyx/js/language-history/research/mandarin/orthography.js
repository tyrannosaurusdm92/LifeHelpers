// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "mandarin",
  "language": "Mandarin Chinese (Standard Mandarin focus)",
  "category": "Asian / Sinitic",
  "kind": "orthography-and-unicode",
  "data": {
    "script": {
      "name": "Han-character writing; Pinyin is auxiliary Romanization",
      "stages": [
        "Oracle-bone inscriptions",
        "Bronze inscriptions and regional Warring States forms",
        "Qin small seal and Han clerical forms",
        "Regular, running and cursive calligraphy",
        "1956 PRC character-simplification scheme and later standards",
        "Modern traditional/simplified forms and Unicode encoding"
      ],
      "glyphNotes": "Incision, seal cutting and brush movement produce different visible strokes. Running and cursive can join or omit strokes. The 1956 reform codified a set of simplified forms; later standards and regional practice affect which forms are in use. Unicode encodes characters, not the physical stroke sequence; glyph forms vary by font and region.",
      "unicodeExamples": [
        {
          "text": "好",
          "points": [
            "U+597D"
          ],
          "meaning": "CJK Unified Ideograph; character is not an alphabetic pronunciation spelling"
        },
        {
          "text": "ā",
          "points": [
            "U+0101"
          ],
          "meaning": "Pinyin a, first tone"
        },
        {
          "text": "á",
          "points": [
            "U+00E1"
          ],
          "meaning": "Pinyin a, second tone"
        },
        {
          "text": "ǎ",
          "points": [
            "U+01CE"
          ],
          "meaning": "Pinyin a, third tone"
        },
        {
          "text": "à",
          "points": [
            "U+00E0"
          ],
          "meaning": "Pinyin a, fourth tone"
        },
        {
          "text": "ē",
          "points": [
            "U+0113"
          ],
          "meaning": "Pinyin e, first tone"
        },
        {
          "text": "ě",
          "points": [
            "U+011B"
          ],
          "meaning": "Pinyin e, third tone"
        },
        {
          "text": "ī",
          "points": [
            "U+012B"
          ],
          "meaning": "Pinyin i, first tone"
        },
        {
          "text": "ǐ",
          "points": [
            "U+01D0"
          ],
          "meaning": "Pinyin i, third tone"
        },
        {
          "text": "ō",
          "points": [
            "U+014D"
          ],
          "meaning": "Pinyin o, first tone"
        },
        {
          "text": "ǒ",
          "points": [
            "U+01D2"
          ],
          "meaning": "Pinyin o, third tone"
        },
        {
          "text": "ū",
          "points": [
            "U+016B"
          ],
          "meaning": "Pinyin u, first tone"
        },
        {
          "text": "ǔ",
          "points": [
            "U+01D4"
          ],
          "meaning": "Pinyin u, third tone"
        },
        {
          "text": "ü",
          "points": [
            "U+00FC"
          ],
          "meaning": "Pinyin u with diaeresis"
        },
        {
          "text": "ǖ",
          "points": [
            "U+01D6"
          ],
          "meaning": "Pinyin ü, first tone"
        },
        {
          "text": "ǘ",
          "points": [
            "U+01D8"
          ],
          "meaning": "Pinyin ü, second tone"
        },
        {
          "text": "ǚ",
          "points": [
            "U+01DA"
          ],
          "meaning": "Pinyin ü, third tone"
        },
        {
          "text": "ǜ",
          "points": [
            "U+01DC"
          ],
          "meaning": "Pinyin ü, fourth tone"
        },
        {
          "text": "́",
          "points": [
            "U+0301"
          ],
          "meaning": "combining acute, second tone"
        },
        {
          "text": "̌",
          "points": [
            "U+030C"
          ],
          "meaning": "combining caron, third tone"
        },
        {
          "text": "̀",
          "points": [
            "U+0300"
          ],
          "meaning": "combining grave, fourth tone"
        },
        {
          "text": "̄",
          "points": [
            "U+0304"
          ],
          "meaning": "combining macron, first tone"
        },
        {
          "text": "ǔ",
          "points": [
            "U+0075",
            "U+030C"
          ],
          "meaning": "decomposed u plus combining caron; diaeresis may add U+0308"
        }
      ],
      "normalization": "Preserve Pinyin tone and ü distinctions. Use NFC/NFD consistently for text matching; do not strip tone marks or treat a Han character code point as its pronunciation.",
      "subscripts": "No native subscript letters in Mandarin Han writing or Hanyu Pinyin. Linguistic reconstruction notation is separate.",
      "sources": [
        "M6",
        "M7",
        "M8",
        "M9",
        "M14",
        "U1",
        "U2",
        "U5"
      ]
    }
  },
  "sources": [
    {
      "id": "M6",
      "label": "Ministry of Education of the PRC, 1958 Pinyin scheme",
      "url": "https://www.moe.gov.cn/jyb_sjzl/ziliao/A19/195802/t19580201_186000.html"
    },
    {
      "id": "M7",
      "label": "Smithsonian National Museum of Asian Art, Chinese character styles",
      "url": "https://asia-archive.si.edu/learn/chinas-calligraphic-arts/"
    },
    {
      "id": "M8",
      "label": "Smithsonian, Understanding Chinese Characters",
      "url": "https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/lesson-plans/understanding-chinese-characters/"
    },
    {
      "id": "M9",
      "label": "Unicode CJK Unified Ideographs chart",
      "url": "https://www.unicode.org/charts/PDF/U4E00.pdf"
    },
    {
      "id": "M14",
      "label": "PRC Ministry of Education, State Council 1956 resolution on the Chinese Character Simplification Scheme",
      "url": "https://www.moe.gov.cn/jyb_xwfb/xw_fbh/moe_2128/moe_2326/moe_1144/tnull_14350.html"
    },
    {
      "id": "U1",
      "label": "Unicode Consortium, Characters and Combining Marks FAQ",
      "url": "https://www.unicode.org/faq/char_combmark.html"
    },
    {
      "id": "U2",
      "label": "Unicode Standard Annex #15, Normalization Forms",
      "url": "https://www.unicode.org/reports/tr15/"
    },
    {
      "id": "U5",
      "label": "Unicode Standard, Chapter 18: East Asia",
      "url": "https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-18/"
    },
    {
      "id": "U6",
      "label": "Unicode Consortium, Version 18.0.0 publication (2026-09-16)",
      "url": "https://www.unicode.org/versions/Unicode18.0.0/"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
