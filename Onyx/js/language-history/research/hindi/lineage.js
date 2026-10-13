// Extended historical-linguistics dataset. Dates and reconstructions are explicitly qualified.
const record = {
  "id": "hindi",
  "language": "Hindi (Modern Standard Hindi; Hindustani continuum)",
  "kind": "lineage",
  "data": {
    "rootline": "Hindi is New Indo-Aryan and belongs to the Indo-Iranian branch of Indo-European. Its history is not a direct, uninterrupted “Sanskrit became Hindi” line: Middle Indo-Aryan varieties (including Prakrits and Apabhraṃśa traditions) intervene, and reconstruction depends on comparative evidence. Hindustani describes a shared colloquial base from which standardized Hindi and Urdu developed distinct registers and scripts.",
    "familyTree": [
      "Indo-European",
      "Indo-Iranian",
      "Indo-Aryan",
      "New Indo-Aryan",
      "Hindustani continuum",
      "Standard Hindi"
    ],
    "siblings": [
      "Urdu (closely related standard register in the Hindustani continuum; Perso-Arabic script)",
      "Punjabi (Northwestern Indo-Aryan)",
      "Gujarati (Western Indo-Aryan)",
      "Bengali (Eastern Indo-Aryan)",
      "Marathi (Southern Indo-Aryan)"
    ],
    "root": {
      "node": "Proto-Indo-Aryan (with deeper Proto-Indo-Iranian comparison)",
      "qualifyingAgeBP": 3500,
      "rangeBP": [
        3200,
        3800
      ],
      "sourceKeys": [
        "D1",
        "D2"
      ],
      "confidence": "moderate for Vedic attestation horizon; lower for exact proto-stage dating",
      "basis": "The Ṛgveda is conventionally dated to around 1500 BCE within a broader c.1500–500 BCE composition horizon; the texts were transmitted orally and surviving written records are much later. Proto-Indo-Aryan itself is reconstructed.",
      "date": "The Ṛgveda is conventionally dated to around 1500 BCE within a broader c.1500–500 BCE composition horizon; the texts were transmitted orally and surviving written records are much later. Proto-Indo-Aryan itself is reconstructed.",
      "evidenceType": "The Ṛgveda is conventionally dated to around 1500 BCE within a broader c.1500–500 BCE composition horizon; the texts were transmitted orally and surviving written records are much later. Proto-Indo-Aryan itself is reconstructed.",
      "caution": "moderate for Vedic attestation horizon; lower for exact proto-stage dating",
      "ageAssessment": {
        "requestedMinimumBP": 2500,
        "qualifyingAgeBP": 3500,
        "rangeBP": [
          3200,
          3800
        ],
        "ancestorStage": "Proto-Indo-Aryan (with deeper Proto-Indo-Iranian comparison)",
        "basis": "The Ṛgveda is conventionally dated to around 1500 BCE within a broader c.1500–500 BCE composition horizon; the texts were transmitted orally and surviving written records are much later. Proto-Indo-Aryan itself is reconstructed.",
        "qualification": "meets threshold with explicit uncertainty; see lineage note",
        "datingMethod": "Comparative reconstruction for Proto-Indo-Aryan; Vedic composition chronology is inferred from linguistic and orally transmitted textual traditions.",
        "rangeInterpretation": "A broad horizon bracket, not a statistical confidence interval; Vedic composition dates and the Proto-Indo-Aryan split date are distinct.",
        "qualifyingAgeMeaning": "3,500 BP is a rough Vedic/Indo-Aryan horizon used for the threshold audit; it is not a securely dated Proto-Indo-Aryan split.",
        "documentation": {
          "status": "oral-tradition",
          "stage": "Vedic Sanskrit",
          "dateLabel": "The Ṛgveda is conventionally placed around 1500 BCE within a wider c.1500–500 BCE composition horizon; surviving written records are much later.",
          "note": "This is an oral textual tradition, not a contemporary physical manuscript or inscription.",
          "sourceKeys": ["D1"]
        },
        "sourceKeys": [
          "D1",
          "D2"
        ]
      }
    }
  },
  "sources": [
    {
      "id": "D1",
      "label": "Cambridge, Vedic Sanskrit and the Indo-Aryan record",
      "url": "https://www.cambridge.org/core/books/abs/ancient-languages-of-asia-and-the-americas/sanskrit/CF7D5B91F9736880C0CECAC672754AEB"
    },
    {
      "id": "D2",
      "label": "Cambridge, Hindi–Urdu–Hindustani",
      "url": "https://www.cambridge.org/core/books/abs/language-in-south-asia/hindiurduhindustani/5F6F26244AA8B951DEEA693790323B73"
    },
    {
      "id": "D3",
      "label": "Cambridge, Middle Indic (Prakrit) languages and attestations",
      "url": "https://www.cambridge.org/core/books/abs/ancient-languages-of-asia-and-the-americas/middle-indic/C6C74CC896F96BD1EE8F6E898D35B456"
    },
    {
      "id": "D4",
      "label": "W3C, Devanagari Script Resources and Layout Requirements",
      "url": "https://www.w3.org/TR/deva-lreq/"
    },
    {
      "id": "D5",
      "label": "Unicode 18, Devanagari chart",
      "url": "https://www.unicode.org/Public/18.0.0/charts/PDF/U0900.pdf"
    },
    {
      "id": "D6",
      "label": "Unicode Standard, Chapter 12 South and Central Asia",
      "url": "https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-12/"
    },
    {
      "id": "D7",
      "label": "Central Hindi Directorate, Standard Hindi orthography reference",
      "url": "https://chdpublication.mhrd.gov.in/"
    },
    {
      "id": "D8",
      "label": "Cambridge, Hindi sociolinguistic and standardization history",
      "url": "https://www.cambridge.org/core/books/language-in-south-asia/"
    },
    {
      "id": "D9",
      "label": "Cambridge, rise of Standard Hindi and early Hindi prose",
      "url": "https://www.cambridge.org/core/journals/journal-of-the-royal-asiatic-society/article/abs/rise-of-standard-hindi-and-early-hindi-prose-fiction/75F057672E624387018C5BA3C0161B64"
    },
    {
      "id": "D10",
      "label": "Cambridge, Kaithi and Devanagari in North Indian language history",
      "url": "https://www.cambridge.org/core/journals/modern-asian-studies/article/abs/marginalized-voice-in-the-history-of-hindi/84E174420195AFCB7F8CF347CDDDEF11"
    }
  ]
};
export default record;
