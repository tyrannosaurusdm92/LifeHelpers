// Research dataset. Source links are retained with each module for review.
const record = {
  "id": "mandarin",
  "language": "Mandarin Chinese (Standard Mandarin focus)",
  "category": "Asian / Sinitic",
  "kind": "chronology",
  "data": {
    "rootEvidence": {
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
    },
    "events": [
      {
        "date": "Published models: 5,871–7,983 BP (with wider credible intervals)",
        "event": "Bayesian lexical phylogenies estimate the initial Sino-Tibetan divergence; one 2020 study reports a 95% HPD interval of 4,778–11,285 BP",
        "evidence": "time-calibrated phylogenetic models using cognate datasets and historical calibrations",
        "certainty": "high that published studies report these estimates; moderate/low for a single exact root date because datasets and methods differ",
        "sources": [
          "M11",
          "M12",
          "M13"
        ]
      },
      {
        "date": "13th–11th c. BCE",
        "event": "Late Shang oracle-bone inscriptions attest early written Chinese",
        "evidence": "dated archaeological artifacts and inscriptional study",
        "certainty": "high for attestation; not a speech-origin date",
        "sources": [
          "M1",
          "M8"
        ]
      },
      {
        "date": "Pre-Qin period",
        "event": "Old Chinese is reconstructed from rhyme, character phonetics and later evidence",
        "evidence": "comparative historical phonology",
        "certainty": "moderate; reconstructions are competing models",
        "sources": [
          "M3"
        ]
      },
      {
        "date": "601 CE",
        "event": "Qieyun rhyme tradition supplies a major Middle Chinese reference point",
        "evidence": "dated rhyme dictionary tradition",
        "certainty": "high as a textual anchor",
        "sources": [
          "M3",
          "M4"
        ]
      },
      {
        "date": "1324 CE",
        "event": "Zhongyuan Yinyun documents a system termed Old Mandarin",
        "evidence": "dated rhyme book",
        "certainty": "high as text date; system is not a single dialect recording",
        "sources": [
          "M4"
        ]
      },
      {
        "date": "28 January 1956",
        "event": "State Council approves the Scheme for Simplifying Chinese Characters",
        "evidence": "official resolution and policy history",
        "certainty": "high for resolution date and policy adoption; subsequent use and revisions are separate milestones",
        "sources": [
          "M14"
        ]
      },
      {
        "date": "1958 CE",
        "event": "PRC adopts Hanyu Pinyin as a Romanization scheme",
        "evidence": "government policy document",
        "certainty": "high",
        "sources": [
          "M6"
        ]
      }
    ]
  },
  "sources": [
    {
      "id": "M1",
      "label": "Smithsonian National Museum of Asian Art, oracle-bone object",
      "url": "https://asia.si.edu/education/educator-resources/teaching-china-with-the-smithsonian/explore-by-object/inscribed-tortoise-shell-oracle-bone/"
    },
    {
      "id": "M4",
      "label": "Cambridge, Old Mandarin and Zhongyuan Yinyun",
      "url": "https://www.cambridge.org/core/books/abs/phonological-history-of-chinese/old-mandarin-the-zhongyuan-yinyun/25E3AB35BFBE15663813AA730A0F09EC"
    },
    {
      "id": "M6",
      "label": "Ministry of Education of the PRC, 1958 Pinyin scheme",
      "url": "https://www.moe.gov.cn/jyb_sjzl/ziliao/A19/195802/t19580201_186000.html"
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
    },
    {
      "id": "M14",
      "label": "PRC Ministry of Education, State Council 1956 resolution on the Chinese Character Simplification Scheme",
      "url": "https://www.moe.gov.cn/jyb_xwfb/xw_fbh/moe_2128/moe_2326/moe_1144/tnull_14350.html"
    }
  ],
  "evidenceNote": "Claims are scoped to the named period, branch, orthography or reconstruction; see the source-linked research note for interpretation."
};
export default record;
