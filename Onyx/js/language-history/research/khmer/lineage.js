// Extended historical-linguistics dataset. Dates and reconstructions are explicitly qualified.
const record = {
  "id": "khmer",
  "language": "Khmer (Modern Khmer; historical Old Khmer)",
  "kind": "lineage",
  "data": {
    "rootline": "Khmer belongs to Austroasiatic, specifically the Khmeric grouping in a classification whose internal subgrouping continues to be refined. Khmer is not a Tai language, despite long contact with Thai and Lao. Distant Austroasiatic comparisons such as Mon, Vietnamese, and Khasi do not imply immediate sisterhood; use branch-qualified trees.",
    "familyTree": [
      "Austroasiatic",
      "Khmeric",
      "Khmer continuum",
      "Modern Khmer"
    ],
    "siblings": [
      "Vietnamese (Vietic branch; distant Austroasiatic relative)",
      "Mon (Monic branch; distant relative)",
      "Khasi (Khasic branch; distant relative)",
      "Pearic languages (neighboring Austroasiatic group; not Khmer dialects)"
    ],
    "root": {
      "node": "Proto-Austroasiatic",
      "qualifyingAgeBP": 3500,
      "rangeBP": [
        3000,
        4500
      ],
      "sourceKeys": [
        "K1",
        "K2"
      ],
      "confidence": "contested model; low confidence in exact chronology and homeland",
      "basis": "Interdisciplinary proposals combine comparative linguistics and archaeological evidence; dates are hypotheses, not direct attestations.",
      "date": "Interdisciplinary proposals combine comparative linguistics and archaeological evidence; dates are hypotheses, not direct attestations.",
      "evidenceType": "Interdisciplinary proposals combine comparative linguistics and archaeological evidence; dates are hypotheses, not direct attestations.",
      "caution": "contested model; low confidence in exact chronology and homeland",
      "ageAssessment": {
        "requestedMinimumBP": 2500,
        "qualifyingAgeBP": 3500,
        "rangeBP": [
          3000,
          4500
        ],
        "ancestorStage": "Proto-Austroasiatic",
        "basis": "Interdisciplinary proposals combine comparative linguistics and archaeological evidence; dates are hypotheses, not direct attestations.",
        "qualification": "meets threshold with explicit uncertainty; see lineage note",
        "datingMethod": "Comparative Austroasiatic subgrouping and proposed phylogenetic/archaeological models; absolute dates remain model dependent.",
        "rangeInterpretation": "The 3,000–4,500 BP span summarizes proposals and is not a statistical confidence interval.",
        "qualifyingAgeMeaning": "3,500 BP is a representative audit value for reconstructed Proto-Austroasiatic, not a direct date for Khmer or its earliest inscription.",
        "documentation": {
          "status": "epigraphic",
          "stage": "Old Khmer",
          "dateLabel": "Old Khmer inscriptional evidence is present by the early seventh century CE; dates depend on individual records.",
          "note": "This daughter-language record is millennia later than proposed Proto-Austroasiatic chronology.",
          "sourceKeys": ["K3", "K4"]
        },
        "sourceKeys": [
          "K1",
          "K2"
        ]
      }
    }
  },
  "sources": [
    {
      "id": "K1",
      "label": "Yu et al., Austroasiatic dispersal model (date is a proposal, not consensus)",
      "url": "https://www.nature.com/articles/s41598-017-06832-6"
    },
    {
      "id": "K2",
      "label": "Sidwell, Austroasiatic classification review",
      "url": "https://www.degruyterbrill.com/document/doi/10.1515/lingty-2018-0012/html"
    },
    {
      "id": "K3",
      "label": "ANU, Old Khmer Grammar (early seventh-century attestations)",
      "url": "https://openresearch-repository.anu.edu.au/bitstreams/ad26c181-b3e3-4776-b869-f37dd6c2a1a2/download"
    },
    {
      "id": "K4",
      "label": "EFEO/EPHE, Corpus of Khmer Inscriptions",
      "url": "https://cik.efeo.fr/"
    },
    {
      "id": "K5",
      "label": "Unicode 18, Khmer chart",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U1780.pdf"
    },
    {
      "id": "K6",
      "label": "Unicode 18, Khmer Symbols chart",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U19E0.pdf"
    },
    {
      "id": "K7",
      "label": "W3C, Khmer Script Resources and Layout Requirements",
      "url": "https://www.w3.org/TR/khmr-lreq/"
    },
    {
      "id": "K8",
      "label": "Brill, Khmer onset voicing chronology and register history",
      "url": "https://brill.com/downloadpdf/journals/clao/51/2/article-p175_3.pdf"
    },
    {
      "id": "K9",
      "label": "Unicode Standard, Chapter 16: Khmer script and coeng rendering",
      "url": "https://unicode.org/versions/Unicode18.0.0/core-spec/chapter-16/"
    }
  ]
};
export default record;
