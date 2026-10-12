export function compareProfiles(a, b) {
  if (!a || !b) throw new TypeError('Two research profiles are required');
  return {
    languages: [a.language, b.language],
    categories: [a.category, b.category],
    roots: [a.rootEvidence.date, b.rootEvidence.date],
    datingCautions: [a.rootEvidence.caution, b.rootEvidence.caution],
    siblingCounts: [a.siblings.length, b.siblings.length],
    syllableProfiles: [a.prosodyAndSyntax.syllableProfile, b.prosodyAndSyntax.syllableProfile],
    sentenceProfiles: [a.prosodyAndSyntax.sentenceProfile, b.prosodyAndSyntax.sentenceProfile],
    scripts: [a.orthography.script.name, b.orthography.script.name],
    comparisonLimit: 'These are summaries from different evidence types and time depths; do not infer family relationship from typological similarity.'
  };
}
