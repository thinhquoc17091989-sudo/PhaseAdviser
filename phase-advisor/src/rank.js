const WEIGHTS = { component: 3, label: 2, keyword: 1, sameType: 1 };

/**
 * Scores candidate issues against the source issue and records why each one
 * matched, so the Agent can cite evidence instead of asserting similarity.
 */
export function rankSimilarIssues(source, candidates, limit = 10) {
  const sourceComponents = lowerSet(source.components);
  const sourceLabels = lowerSet(source.labels);
  const keywords = source.keywords ?? [];

  return candidates
    .map((candidate) => {
      const matchedOn = [];
      let score = 0;

      for (const name of candidate.components ?? []) {
        if (sourceComponents.has(name.toLowerCase())) {
          matchedOn.push(`component: ${name}`);
          score += WEIGHTS.component;
        }
      }
      for (const label of candidate.labels ?? []) {
        if (sourceLabels.has(label.toLowerCase())) {
          matchedOn.push(`label: ${label}`);
          score += WEIGHTS.label;
        }
      }
      const summary = (candidate.summary ?? '').toLowerCase();
      for (const keyword of keywords) {
        if (summary.includes(keyword)) {
          matchedOn.push(`keyword: ${keyword}`);
          score += WEIGHTS.keyword;
        }
      }
      if (source.issueType && candidate.issueType === source.issueType) score += WEIGHTS.sameType;

      return { ...candidate, score, matchedOn };
    })
    .filter((candidate) => candidate.matchedOn.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function lowerSet(values = []) {
  return new Set(values.map((value) => String(value).toLowerCase()));
}
