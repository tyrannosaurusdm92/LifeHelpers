const DOCUMENTATION_STATUSES = new Set(['epigraphic', 'oral-tradition', 'none-known']);

export function auditRootAgeCriteria(profiles, minimumBP = 2500, options = {}) {
  if (!profiles || typeof profiles !== 'object') throw new TypeError('A profile map is required');
  if (!Number.isFinite(minimumBP) || minimumBP < 0) throw new RangeError('minimumBP must be a non-negative number');
  const strictEvidence = options.strictEvidence === true;

  const results = Object.entries(profiles).map(([id, profile]) => {
    const assessment = profile.rootEvidence?.ageAssessment;
    const documentation = assessment?.documentation;
    const sourceIds = new Set((profile.sources ?? []).map(source => source.id));
    const sourceKeys = [
      ...(assessment?.sourceKeys ?? []),
      ...(documentation?.sourceKeys ?? [])
    ];
    const missingSources = [...new Set(sourceKeys.filter(key => !sourceIds.has(key)))];
    const ageBP = assessment?.qualifyingAgeBP;
    const rangeBP = assessment?.rangeBP ?? profile.rootEvidence?.rangeBP;
    const validRange = Array.isArray(rangeBP)
      && rangeBP.length === 2
      && rangeBP.every(Number.isFinite)
      && rangeBP[0] <= rangeBP[1];
    const ageWithinRange = validRange
      && Number.isFinite(ageBP)
      && ageBP >= rangeBP[0]
      && ageBP <= rangeBP[1];

    return {
      id,
      language: profile.language,
      ancestorStage: assessment?.ancestorStage ?? null,
      ageBP: Number.isFinite(ageBP) ? ageBP : null,
      rangeBP: validRange ? rangeBP : null,
      rangeUpperOpen: assessment?.rangeUpperOpen === true,
      minimumBP,
      meetsAgeFloor: Number.isFinite(ageBP) && ageBP >= minimumBP,
      ageWithinRange: strictEvidence ? ageWithinRange : null,
      datingMethod: assessment?.datingMethod ?? null,
      rangeInterpretation: assessment?.rangeInterpretation ?? null,
      qualifyingAgeMeaning: assessment?.qualifyingAgeMeaning ?? null,
      documentationStatus: documentation?.status ?? null,
      documentationStage: documentation?.stage ?? null,
      documentationDate: documentation?.dateLabel ?? null,
      sourceKeys: [...new Set(sourceKeys)],
      missingSources,
      siblingCount: Array.isArray(profile.siblings) ? profile.siblings.length : 0
    };
  });

  const errors = [];
  for (const result of results) {
    if (!result.meetsAgeFloor) errors.push(`${result.id}: no cited ancestor age estimate reaches ${minimumBP} BP`);
    if (strictEvidence) {
      if (!result.ageWithinRange) errors.push(`${result.id}: qualifying age must fall inside an ordered, finite BP range`);
      if (!result.datingMethod) errors.push(`${result.id}: state how the ancestor date was estimated`);
      if (!result.rangeInterpretation) errors.push(`${result.id}: explain whether the range is a model range, competing proposals, or an interval`);
      if (result.rangeUpperOpen && !/open|exceed|above/i.test(result.rangeInterpretation ?? '')) errors.push(`${result.id}: open-ended range needs an explicit explanation`);
      if (!result.qualifyingAgeMeaning) errors.push(`${result.id}: explain what the threshold age actually dates`);
      if (!DOCUMENTATION_STATUSES.has(result.documentationStatus)) errors.push(`${result.id}: classify direct documentary evidence`);
      if (!result.documentationStage || !result.documentationDate) errors.push(`${result.id}: state the stage and date of direct evidence, or that none is known`);
    }
    if (!result.sourceKeys.length || result.missingSources.length) errors.push(`${result.id}: root-age and documentary claims need registered source keys`);
    if (result.siblingCount < 3) errors.push(`${result.id}: at least three sibling/comparison entries are required`);
  }

  return { ok: errors.length === 0, minimumBP, profileCount: results.length, results, errors };
}

export default auditRootAgeCriteria;
