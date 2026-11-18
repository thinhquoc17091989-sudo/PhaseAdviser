const STOP_WORDS = new Set([
  'about', 'after', 'again', 'also', 'and', 'are', 'because', 'been', 'before', 'being',
  'could', 'does', 'for', 'from', 'have', 'into', 'issue', 'make', 'need', 'not', 'should',
  'that', 'the', 'their', 'then', 'there', 'this', 'update', 'when', 'where', 'will', 'with',
  'would', 'add', 'fix', 'new', 'use',
]);

const MAX_KEYWORDS = 6;
const MAX_LIST_ITEMS = 10;

/** Keeps letters, digits, spaces and hyphens so a term can never break out of a JQL/CQL string. */
export function sanitizeTerm(value) {
  return String(value ?? '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractKeywords(text, limit = MAX_KEYWORDS) {
  const seen = new Set();
  for (const word of sanitizeTerm(text).toLowerCase().split(' ')) {
    if (word.length > 3 && !STOP_WORDS.has(word)) seen.add(word);
    if (seen.size === limit) break;
  }
  return [...seen];
}

function quoted(values) {
  return values.map((value) => `"${sanitizeTerm(value)}"`).join(', ');
}

/**
 * Builds a JQL query for resolved issues that share components, labels or
 * wording with the given issue. Returns null when there is nothing to match on,
 * so the caller never sends an unbounded query.
 */
export function buildSimilarIssuesJql({ issueKey, components = [], labels = [], keywords = [] }) {
  const clauses = [];
  const cleanComponents = components.map(sanitizeTerm).filter(Boolean).slice(0, MAX_LIST_ITEMS);
  const cleanLabels = labels.map(sanitizeTerm).filter(Boolean).slice(0, MAX_LIST_ITEMS);

  if (cleanComponents.length) clauses.push(`component in (${quoted(cleanComponents)})`);
  if (cleanLabels.length) clauses.push(`labels in (${quoted(cleanLabels)})`);
  for (const keyword of keywords.map(sanitizeTerm).filter(Boolean).slice(0, MAX_KEYWORDS)) {
    clauses.push(`summary ~ "${keyword}"`);
  }
  if (!clauses.length) return null;

  const exclude = /^[A-Z][A-Z0-9_]+-\d+$/i.test(issueKey ?? '')
    ? ` AND key != "${issueKey.toUpperCase()}"`
    : '';
  return `statusCategory = Done${exclude} AND (${clauses.join(' OR ')}) ORDER BY updated DESC`;
}

/** Builds a CQL query for Confluence pages that mention any of the given terms. */
export function buildKnowledgeCql(terms) {
  const clean = terms.map(sanitizeTerm).filter(Boolean).slice(0, MAX_KEYWORDS);
  if (!clean.length) return null;
  const matches = clean.map((term) => `(title ~ "${term}" OR text ~ "${term}")`);
  return `type = page AND (${matches.join(' OR ')}) ORDER BY lastmodified DESC`;
}
