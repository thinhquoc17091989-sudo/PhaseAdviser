import api, { route } from '@forge/api';

import { adfToText } from './adf.js';
import { inferPhase } from './phase.js';
import { buildKnowledgeCql, buildSimilarIssuesJql, extractKeywords } from './query.js';
import { rankSimilarIssues } from './rank.js';

const ISSUE_KEY_PATTERN = /^[A-Z][A-Z0-9_]{1,19}-[1-9][0-9]*$/i;
const ISSUE_FIELDS = [
  'summary', 'description', 'issuetype', 'status', 'priority', 'labels',
  'components', 'resolution', 'resolutiondate', 'issuelinks',
];

/**
 * Returns the issue's fields and the development phase inferred from its
 * status. When invoked from an issue the key comes from Jira context.
 */
export async function getIssueContext(payload = {}) {
  const issue = await fetchIssue(resolveIssueKey(payload));
  return { ...summariseIssue(issue, 3000), phase: inferPhase({
    statusName: issue.fields?.status?.name,
    statusCategoryKey: issue.fields?.status?.statusCategory?.key,
    override: payload.phase,
  }) };
}

/**
 * Finds resolved issues that share components, labels or wording with the
 * given issue and ranks them, recording why each one matched.
 */
export async function findSimilarIssues(payload = {}) {
  const issue = await fetchIssue(resolveIssueKey(payload));
  const source = summariseIssue(issue, 0);
  const keywords = extractKeywords(`${source.summary} ${payload.keywords ?? ''}`);

  const jql = buildSimilarIssuesJql({
    issueKey: source.key,
    components: source.components,
    labels: source.labels,
    keywords,
  });
  if (!jql) {
    return { sourceIssue: source.key, matches: [], note: 'The issue has no components, labels or usable keywords to search on.' };
  }

  const response = await api.asUser().requestJira(route`/rest/api/3/search/jql`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ jql, maxResults: 50, fields: ISSUE_FIELDS }),
  });
  const data = await readResponse(response, 'search for similar issues');

  const candidates = (data.issues ?? []).map((candidate) => summariseIssue(candidate, 1200));
  const matches = rankSimilarIssues({ ...source, keywords }, candidates);

  return {
    sourceIssue: source.key,
    searchedFor: { components: source.components, labels: source.labels, keywords },
    matches,
    note: matches.length ? undefined : 'No resolved issues matched. Say so; do not invent history.',
  };
}

/** Searches Confluence for pages that mention the given terms or the issue's components. */
export async function searchKnowledge(payload = {}) {
  let terms = splitTerms(payload.terms);

  if (!terms.length) {
    const issue = await fetchIssue(resolveIssueKey(payload));
    const source = summariseIssue(issue, 0);
    terms = [...source.components, ...extractKeywords(source.summary, 3)];
  }

  const cql = buildKnowledgeCql(terms);
  if (!cql) {
    return { terms, pages: [], note: 'No terms to search for. Ask the user for a component or topic.' };
  }

  const response = await api.asUser().requestConfluence(
    route`/wiki/rest/api/search?cql=${cql}&limit=10&excerpt=highlight`,
    { headers: { Accept: 'application/json' } },
  );
  const data = await readResponse(response, 'search Confluence');

  const pages = (data.results ?? []).map((result) => ({
    title: stripHighlight(result.content?.title ?? result.title ?? ''),
    space: result.resultGlobalContainer?.title ?? '',
    excerpt: stripHighlight(result.excerpt ?? '').slice(0, 400),
    lastModified: result.lastModified ?? null,
    url: result.url ? `${data._links?.base ?? ''}${result.url}` : null,
  }));

  return {
    terms,
    pages,
    note: pages.length ? undefined : 'No Confluence pages matched. Say so; do not invent documentation.',
  };
}

function resolveIssueKey(payload = {}) {
  const supplied = normaliseKey(payload.issueKey);
  const fromContext = normaliseKey(payload.context?.jira?.issueKey);
  const issueKey = ISSUE_KEY_PATTERN.test(supplied) ? supplied : fromContext;

  if (!ISSUE_KEY_PATTERN.test(issueKey)) {
    throw new Error('Provide a valid Jira issue key or invoke the Agent from an issue.');
  }
  return issueKey;
}

function normaliseKey(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

async function fetchIssue(issueKey) {
  const response = await api.asUser().requestJira(
    route`/rest/api/3/issue/${issueKey}?fields=${ISSUE_FIELDS.join(',')}`,
    { headers: { Accept: 'application/json' } },
  );
  return readResponse(response, `retrieve issue ${issueKey}`);
}

function summariseIssue(issue, descriptionLength) {
  const fields = issue.fields ?? {};
  return {
    key: issue.key,
    summary: fields.summary ?? '',
    issueType: fields.issuetype?.name ?? 'Unknown',
    status: fields.status?.name ?? 'Unknown',
    priority: fields.priority?.name ?? 'None',
    labels: fields.labels ?? [],
    components: (fields.components ?? []).map(({ name }) => name),
    resolution: fields.resolution?.name ?? null,
    resolvedOn: fields.resolutiondate ?? null,
    description: descriptionLength ? adfToText(fields.description, descriptionLength) : '',
    linkedIssues: (fields.issuelinks ?? []).slice(0, 15).map((link) => {
      const other = link.outwardIssue ?? link.inwardIssue;
      return {
        relationship: (link.outwardIssue ? link.type?.outward : link.type?.inward) ?? 'relates to',
        key: other?.key ?? 'Unknown',
        summary: other?.fields?.summary ?? '',
      };
    }),
  };
}

function splitTerms(value) {
  return typeof value === 'string' ? value.split(/[,;\n]/).map((term) => term.trim()).filter(Boolean) : [];
}

function stripHighlight(text) {
  return text.replace(/@@@(end)?hl@@@/g, '');
}

async function readResponse(response, operation) {
  if (!response.ok) {
    // The raw error body can contain tenant details that are of no use to the Agent.
    throw new Error(`Unable to ${operation}. The product returned status ${response.status}.`);
  }
  return response.json();
}
