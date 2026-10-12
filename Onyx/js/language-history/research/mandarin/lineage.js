// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "mandarin",
  "language": "Mandarin Chinese (Standard Mandarin focus)",
  "category": "Asian / Sinitic",
  "kind": "lineage",
  "data": {
    "familyTree": [
      "Sino-Tibetan",
      "Sinitic",
      "Mandarin",
      "Standard Mandarin"
    ],
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
    "root": {
      "node": "Sino-Tibetan family root (phylogenetic estimate), with Late Shang Old Chinese attestation recorded separately",
      "date": "Bayesian phylogenetic studies estimate initial Sino-Tibetan divergence at 5,871 BP and 7,184 BP in two 2019 studies; a broader 131-language study estimated a mean root age of 7,983 BP (95% highest posterior density interval 4,778–11,285 BP). BP uses the 1950 baseline. These modeled family ages are not dates for the Sinitic split, Old Chinese writing, or Mandarin. Late Shang oracle-bone records independently attest written Old Chinese in the 13th–11th centuries BCE.",
      "evidenceType": "Bayesian lexical phylogeny with historical calibrations; separate inscriptional attestation for Old Chinese",
      "confidence": "moderate for an ancient family root; calendar estimates and top-level branching depend on sample, cognate coding, calibrations, and model",
      "caution": "The models support an ancestor older than 2,500–3,500 years, but they do not date Mandarin or the Sinitic branch directly. Sino-Tibetan internal classification and the Sinitic/non-Sinitic branching model remain debated. Oracle-bone writing dates an artifact record, not spoken language origin.",
      "ageAssessment": {
        "requestedMinimumBP": 2500,
        "qualifyingAgeBP": 4778,
        "rangeBP": [
          4778,
          11285
        ],
        "pointEstimatesBP": [
          5871,
          7184,
          7983
        ],
        "ancestorStage": "Sino-Tibetan family root (proposed phylogenetic root)",
        "basis": "Lower bound of one 2020 study’s 95% highest posterior density interval; listed point estimates come from three Bayesian lexical phylogenies.",
        "qualification": "meets threshold in published models; exact age and top-level branching are uncertain",
        "sourceKeys": [
          "M11",
          "M12",
          "M13"
        ]
      }
    }
  },
  "sources": [
    {
      "id": "M2",
      "label": "Oxford Handbook of Chinese Linguistics, Sinitic classification",
      "url": "https://academic.oup.com/edited-volume/38607/chapter-abstract/334718815"
    },
    {
      "id": "M3",
      "label": "Cambridge, An Introduction to Chinese Historical Phonology",
      "url": "https://www.cambridge.org/core/books/abs/phonological-history-of-chinese/an-introduction-to-chinese-historical-phonology/7A1DECBDCB0C27F0486F3409A697D592"
    },
    {
      "id": "M5",
      "label": "Oxford Academic, Sinitic historical and typological overview",
      "url": "https://academic.oup.com/book/38951/chapter-abstract/338155819"
    },
    {
      "id": "M11",
      "label": "Zhang et al., Dated phylogeny suggests early Neolithic origin of Sino-Tibetan languages (2020)",
      "url": "https://www.nature.com/articles/s41598-020-77404-4"
    },
    {
      "id": "M12",
      "label": "Zhang et al., Phylogenetic evidence for Sino-Tibetan origin in northern China in the Late Neolithic (2019)",
      "url": "https://www.nature.com/articles/s41586-019-1153-z"
    },
    {
      "id": "M13",
      "label": "Sagart et al., Dated language phylogenies shed light on the ancestry of Sino-Tibetan (2019; PMC full text)",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6534992/"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
