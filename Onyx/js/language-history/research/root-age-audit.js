export function auditRootAgeCriteria(profiles, minimumBP = 2500) {
  if (!profiles || typeof profiles !== 'object') throw new TypeError('A profile map is required');
  if (!Number.isFinite(minimumBP) || minimumBP < 0) throw new RangeError('minimumBP must be a non-negative number');
  const results = Object.entries(profiles).map(([id, profile]) => {
    const assessment = profile.rootEvidence?.ageAssessment;
    const sourceIds = new Set((profile.sources ?? []).map(source => source.id));
    const missingSources = (assessment?.sourceKeys ?? []).filter(key => !sourceIds.has(key));
    const ageBP = assessment?.qualifyingAgeBP;
    return {
      id,
      language: profile.language,
      ancestorStage: assessment?.ancestorStage ?? null,
      ageBP: Number.isFinite(ageBP) ? ageBP : null,
      minimumBP,
      meetsAgeFloor: Number.isFinite(ageBP) && ageBP >= minimumBP,
      qualification: assessment?.qualification ?? null,
      sourceKeys: assessment?.sourceKeys ?? [],
      missingSources,
      siblingCount: Array.isArray(profile.siblings) ? profile.siblings.length : 0
    };
  });
  const errors = [];
  for (const result of results) {
    if (!result.meetsAgeFloor) errors.push(`${result.id}: no cited ancestor age estimate reaches ${minimumBP} BP`);
    if (!result.sourceKeys.length || result.missingSources.length) errors.push(`${result.id}: root-age assessment needs registered source keys`);
    if (result.siblingCount < 3) errors.push(`${result.id}: at least three sibling/comparison entries are required`);
  }
  return { ok: errors.length === 0, minimumBP, profileCount: results.length, results, errors };
}

export default auditRootAgeCriteria;
