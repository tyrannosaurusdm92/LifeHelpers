// Extended historical-linguistics dataset. Dates and reconstructions are explicitly qualified.
const record = {
  "id": "georgian",
  "language": "Georgian (Kartuli)",
  "kind": "lineage",
  "data": {
    "rootline": "Georgian is Kartvelian (South Caucasian), not Indo-European. The secure family comparison is with Svan and the Zan languages Mingrelian and Laz. Proto-Kartvelian is reconstructed from systematic correspondences; its date, homeland, and proposed links to archaeological cultures are debated. Ancient ethnonyms cannot be equated one-to-one with a modern language.",
    "familyTree": [
      "Kartvelian",
      "Karto-Zan",
      "Georgian"
    ],
    "siblings": [
      "Mingrelian (Zan; close Kartvelian relative)",
      "Laz (Zan; close Kartvelian relative)",
      "Svan (separate Kartvelian branch)",
      "Judeo-Georgian varieties (Georgian-based ethnolects, not a separate family branch)"
    ],
    "root": {
      "node": "Proto-Kartvelian",
      "qualifyingAgeBP": 3950,
      "rangeBP": [
        3950,
        12500
      ],
      "rangeUpperOpen": true,
      "sourceKeys": [
        "G1",
        "G2"
      ],
      "confidence": "very low for exact dating; family relationship is secure",
      "basis": "Dating is disputed. The 2023 study reports older comparative estimates of 3,950–4,750 BP for the Svan versus Proto-Georgian-Zan split and proposes a separate interdisciplinary model above 12,500 BP. The 3,950 BP audit value is the low end of the comparative estimates it summarizes, not consensus or direct attestation; the article notes limitations in uncertainty measurement and external validation for earlier calculations.",
      "date": "Dating is disputed. The 2023 study reports older comparative estimates of 3,950–4,750 BP for the Svan versus Proto-Georgian-Zan split and proposes a separate interdisciplinary model above 12,500 BP. The 3,950 BP audit value is the low end of the comparative estimates it summarizes, not consensus or direct attestation; the article notes limitations in uncertainty measurement and external validation for earlier calculations.",
      "evidenceType": "Dating is disputed. The 2023 study reports older comparative estimates of 3,950–4,750 BP for the Svan versus Proto-Georgian-Zan split and proposes a separate interdisciplinary model above 12,500 BP. The 3,950 BP audit value is the low end of the comparative estimates it summarizes, not consensus or direct attestation; the article notes limitations in uncertainty measurement and external validation for earlier calculations.",
      "caution": "very low for exact dating; family relationship is secure",
      "ageAssessment": {
        "requestedMinimumBP": 2500,
        "qualifyingAgeBP": 3950,
        "rangeBP": [
          3950,
          12500
        ],
        "ancestorStage": "Proto-Kartvelian",
        "basis": "Dating is disputed. The 2023 study reports older comparative estimates of 3,950–4,750 BP for the Svan versus Proto-Georgian-Zan split and proposes a separate interdisciplinary model above 12,500 BP. The 3,950 BP audit value is the low end of the comparative estimates it summarizes, not consensus or direct attestation; the article notes limitations in uncertainty measurement and external validation for earlier calculations.",
        "qualification": "meets threshold with explicit uncertainty; see lineage note",
        "datingMethod": "Competing comparative split-date estimates and a 2023 interdisciplinary Bayesian model combining linguistic, ecological, archaeological, and population-genetic evidence.",
        "rangeInterpretation": "Composite envelope across unlike models, not a confidence interval; includes reported 3,950–4,750 BP comparative estimates and a separate proposal above 12,500 BP.",
        "rangeUpperOpen": true,
        "qualifyingAgeMeaning": "3,950 BP is the low end of the comparative split estimates summarized by the cited study, not a consensus date or direct attestation.",
        "documentation": {
          "status": "epigraphic",
          "stage": "Georgian",
          "dateLabel": "Georgian inscriptions are conventionally attested from the fifth century CE; individual artifact chronologies vary.",
          "note": "The written record is far later than the reconstructed Proto-Kartvelian stage.",
          "sourceKeys": ["G9"]
        },
        "sourceKeys": [
          "G1",
          "G2"
        ]
      }
    }
  },
  "sources": [
    {
      "id": "G1",
      "label": "Cambridge, Early Georgian and Kartvelian classification",
      "url": "https://www.cambridge.org/core/books/abs/ancient-languages-of-asia-minor/early-georgian/77E0BDB0644538696593D7D3B1500E7E"
    },
    {
      "id": "G2",
      "label": "Scientific Reports, Proto-Kartvelian dating model (hypothesis; interpret cautiously)",
      "url": "https://www.nature.com/articles/s41598-023-45500-w"
    },
    {
      "id": "G3",
      "label": "UNESCO, Georgian alphabet and three writing systems",
      "url": "https://ich.unesco.org/en/RL/living-culture-of-three-writing-systems-of-the-georgian-alphabet-01205"
    },
    {
      "id": "G4",
      "label": "Unicode 18, Georgian block",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U10A0.pdf"
    },
    {
      "id": "G5",
      "label": "Unicode 18, Georgian Extended",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U1C90.pdf"
    },
    {
      "id": "G6",
      "label": "Unicode 18, Georgian Supplement",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U2D00.pdf"
    },
    {
      "id": "G7",
      "label": "Georgian National Archives",
      "url": "https://archive.gov.ge/en"
    },
    {
      "id": "G8",
      "label": "Cambridge, Kartvelian language classification and structure",
      "url": "https://www.cambridge.org/core/books/abs/companion-to-endangered-languages/kartvelian-languages/9D54CB9A31F0C83CF67B934BAC1843A9"
    },
    {
      "id": "G9",
      "label": "Harvard Davis Center, Georgian script history and fifth-century inscriptions",
      "url": "https://daviscenter.fas.harvard.edu/research-initiatives/program-georgian-studies/cultural-highlights-georgia"
    }
  ]
};
export default record;
