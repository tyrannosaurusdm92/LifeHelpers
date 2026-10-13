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
      "qualifyingAgeBP": 5000,
      "rangeBP": [
        5000,
        14500
      ],
      "sourceKeys": [
        "G1",
        "G2"
      ],
      "confidence": "very low for exact dating; family relationship is secure",
      "basis": "Dating is disputed: proposals place Proto-Kartvelian in the fourth–third millennia BCE, while one 2023 Bayesian multidisciplinary model suggests over 12,500 BP. The 5,000 BP qualifying value represents the younger traditional proposal (roughly the fourth–third millennia BCE), not a consensus point estimate; neither date is direct attestation.",
      "date": "Dating is disputed: proposals place Proto-Kartvelian in the fourth–third millennia BCE, while one 2023 Bayesian multidisciplinary model suggests over 12,500 BP. The 5,000 BP qualifying value represents the younger traditional proposal (roughly the fourth–third millennia BCE), not a consensus point estimate; neither date is direct attestation.",
      "evidenceType": "Dating is disputed: proposals place Proto-Kartvelian in the fourth–third millennia BCE, while one 2023 Bayesian multidisciplinary model suggests over 12,500 BP. The 5,000 BP qualifying value represents the younger traditional proposal (roughly the fourth–third millennia BCE), not a consensus point estimate; neither date is direct attestation.",
      "caution": "very low for exact dating; family relationship is secure",
      "ageAssessment": {
        "requestedMinimumBP": 2500,
        "qualifyingAgeBP": 5000,
        "rangeBP": [
          5000,
          14500
        ],
        "ancestorStage": "Proto-Kartvelian",
        "basis": "Dating is disputed: proposals place Proto-Kartvelian in the fourth–third millennia BCE, while one 2023 Bayesian multidisciplinary model suggests over 12,500 BP. The 5,000 BP qualifying value represents the younger traditional proposal (roughly the fourth–third millennia BCE), not a consensus point estimate; neither date is direct attestation.",
        "qualification": "meets threshold with explicit uncertainty; see lineage note",
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
