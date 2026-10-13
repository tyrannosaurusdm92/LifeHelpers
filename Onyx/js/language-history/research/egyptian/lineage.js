// Extended historical-linguistics dataset. Dates and reconstructions are explicitly qualified.
const record = {
  "id": "egyptian",
  "language": "Ancient Egyptian (historical stages; Afroasiatic)",
  "kind": "lineage",
  "data": {
    "rootline": "Ancient Egyptian is a distinct branch of Afroasiatic, not a sister dialect of Arabic or Hebrew. Its recorded stages are conventionally Old Egyptian, Middle Egyptian, Late Egyptian, Demotic, and Coptic, each reflecting chronological and register differences. Comparative Afroasiatic ties link Egyptian with Semitic, Berber, Cushitic, Chadic, and other groupings, but deep subgroup relationships and the proto-language date are debated.",
    "familyTree": [
      "Afroasiatic",
      "Egyptian",
      "Old Egyptian",
      "Middle Egyptian",
      "Late Egyptian",
      "Demotic",
      "Coptic"
    ],
    "siblings": [
      "Semitic languages (distinct Afroasiatic branch; includes Aramaic, Hebrew, Arabic)",
      "Berber/Amazigh languages (distinct Afroasiatic branch)",
      "Cushitic languages (distinct Afroasiatic branch)",
      "Chadic languages (distinct Afroasiatic branch)",
      "Omotic languages (classification debated)"
    ],
    "root": {
      "node": "Proto-Afroasiatic (deep reconstructed ancestor; Egyptian is one daughter branch)",
      "qualifyingAgeBP": 8000,
      "rangeBP": [
        8000,
        15000
      ],
      "rangeUpperOpen": true,
      "sourceKeys": [
        "E9",
        "E10"
      ],
      "confidence": "very low for exact deep dates and homeland; proposed dates differ by millennia",
      "basis": "Published Proto-Afroasiatic chronology proposals vary widely: some place it around 8,000–10,000 years ago and others at 15,000 years or more. The 8,000 BP value is the younger edge of the cited proposals, not a consensus estimate; Egyptian hieroglyphic attestation is a separate datum.",
      "date": "Published Proto-Afroasiatic chronology proposals vary widely: some place it around 8,000–10,000 years ago and others at 15,000 years or more. The 8,000 BP value is the younger edge of the cited proposals, not a consensus estimate; Egyptian hieroglyphic attestation is a separate datum.",
      "evidenceType": "Published Proto-Afroasiatic chronology proposals vary widely: some place it around 8,000–10,000 years ago and others at 15,000 years or more. The 8,000 BP value is the younger edge of the cited proposals, not a consensus estimate; Egyptian hieroglyphic attestation is a separate datum.",
      "caution": "very low for exact deep dates and homeland; proposed dates differ by millennia",
      "ageAssessment": {
        "requestedMinimumBP": 2500,
        "qualifyingAgeBP": 8000,
        "rangeBP": [
          8000,
          15000
        ],
        "ancestorStage": "Proto-Afroasiatic (deep reconstructed ancestor; Egyptian is one daughter branch)",
        "basis": "Published Proto-Afroasiatic chronology proposals vary widely: some place it around 8,000–10,000 years ago and others at 15,000 years or more. The 8,000 BP value is the younger edge of the cited proposals, not a consensus estimate; Egyptian hieroglyphic attestation is a separate datum.",
        "qualification": "meets threshold with explicit uncertainty; see lineage note",
        "datingMethod": "Comparative reconstruction of Afroasiatic with competing chronology proposals; the proto-language has no direct written record.",
        "rangeInterpretation": "A published-model envelope with an open upper end: some proposals exceed 15,000 BP; it is not a statistical confidence interval.",
        "rangeUpperOpen": true,
        "qualifyingAgeMeaning": "8,000 BP is the younger edge of cited Proto-Afroasiatic proposals, not the age of Egyptian texts or the Egyptian branch's first attestation.",
        "documentation": {
          "status": "epigraphic",
          "stage": "Ancient Egyptian",
          "dateLabel": "Egyptian writing is attested in the late fourth millennium BCE; the exact dating of early records is archaeological, not a Proto-Afroasiatic date.",
          "note": "Egyptian is one later-attested daughter branch of Afroasiatic.",
          "sourceKeys": ["E4"]
        },
        "sourceKeys": [
          "E9",
          "E10"
        ]
      }
    }
  },
  "sources": [
    {
      "id": "E1",
      "label": "University of Chicago, Ancient Egyptian Language Program: five stages and chronology",
      "url": "https://mes.uchicago.edu/languages/ancient-egyptian-language-program"
    },
    {
      "id": "E2",
      "label": "Cambridge, Ancient Egyptian as an autonomous Afroasiatic branch",
      "url": "https://www.cambridge.org/core/books/abs/ancient-egyptian/language-of-ancient-egypt/83FF2825CC9D595A421DDBE46A35EE47"
    },
    {
      "id": "E3",
      "label": "University of Chicago, Old Egyptian course/stage",
      "url": "https://mes.uchicago.edu/taxonomy/term/99"
    },
    {
      "id": "E4",
      "label": "University of Chicago, Egyptian language chronology and scripts",
      "url": "https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/oimp32.pdf"
    },
    {
      "id": "E5",
      "label": "Unicode 18, Egyptian Hieroglyphs chart",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U13000.pdf"
    },
    {
      "id": "E6",
      "label": "Unicode 18, Egyptian Hieroglyph Format Controls",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U13430.pdf"
    },
    {
      "id": "E7",
      "label": "Unicode Standard, Chapter 11 African and West Asian scripts",
      "url": "https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-11/"
    },
    {
      "id": "E8",
      "label": "Cambridge, Egyptian phonology and limits of historical reconstruction",
      "url": "https://www.cambridge.org/core/books/abs/ancient-egyptian/egyptian-phonology/23B7D5888A4B35A64377E8FE62B8F9EF"
    },
    {
      "id": "E9",
      "label": "Blažek, Origins and expansion of Afro-Asiatic: chronology proposals and methodological cautions",
      "url": "https://doi.org/10.4000/bmsap.564"
    },
    {
      "id": "E10",
      "label": "Glottolog bibliography, Militarev, Towards the chronology of Afrasian and daughter families",
      "url": "https://glottolog.org/resource/reference/id/144297"
    }
  ]
};
export default record;
