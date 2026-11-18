import assert from 'node:assert/strict';
import { test } from 'node:test';

import { inferPhase } from '../src/phase.js';
import { buildKnowledgeCql, buildSimilarIssuesJql, extractKeywords, sanitizeTerm } from '../src/query.js';
import { rankSimilarIssues } from '../src/rank.js';

test('inferPhase maps common status names', () => {
  const cases = {
    'To Do': 'change-request',
    'Impact Analysis': 'change-request',
    'In Progress': 'development',
    'In Development': 'development',
    'In Test': 'testing',
    'QA Verification': 'testing',
    'In Review': 'review',
    'Code Review': 'review',
    Done: 'done',
    Closed: 'done',
  };
  for (const [statusName, phase] of Object.entries(cases)) {
    assert.equal(inferPhase({ statusName }).phase, phase, statusName);
  }
});

test('inferPhase falls back to the status category and marks it unsure', () => {
  const result = inferPhase({ statusName: 'Pending vendor', statusCategoryKey: 'indeterminate' });
  assert.equal(result.phase, 'development');
  assert.equal(result.confident, false);
});

test('inferPhase reports unknown rather than guessing', () => {
  assert.equal(inferPhase({ statusName: 'Parking lot' }).phase, 'unknown');
});

test('inferPhase honours a valid user override only', () => {
  assert.equal(inferPhase({ statusName: 'To Do', override: 'testing' }).phase, 'testing');
  assert.equal(inferPhase({ statusName: 'To Do', override: 'bogus' }).phase, 'change-request');
});

test('sanitizeTerm removes characters that could break out of a query string', () => {
  assert.equal(sanitizeTerm('NvM" OR project = X --'), 'NvM OR project X --');
  assert.equal(sanitizeTerm('a\\"b'), 'a b');
});

test('extractKeywords drops stop words and short words and caps the count', () => {
  const words = extractKeywords('Fix the NvM buffer overflow when writing large blocks after reset');
  assert.deepEqual(words, ['buffer', 'overflow', 'writing', 'large', 'blocks', 'reset']);
  assert.ok(!words.includes('when') && !words.includes('after') && !words.includes('nvm'));
});

test('buildSimilarIssuesJql is bounded, excludes the source and escapes input', () => {
  const jql = buildSimilarIssuesJql({
    issueKey: 'auto-12',
    components: ['COM', 'Nv"M'],
    labels: ['memory'],
    keywords: ['overflow'],
  });
  assert.match(jql, /^statusCategory = Done AND key != "AUTO-12" AND \(/);
  assert.match(jql, /component in \("COM", "Nv M"\)/);
  assert.match(jql, /labels in \("memory"\)/);
  assert.match(jql, /summary ~ "overflow"/);
  assert.ok(!jql.includes('Nv"M'));
});

test('buildSimilarIssuesJql returns null when there is nothing to match on', () => {
  assert.equal(buildSimilarIssuesJql({ issueKey: 'A-1' }), null);
  assert.equal(buildSimilarIssuesJql({ issueKey: 'A-1', components: ['  '], keywords: ['"'] }), null);
});

test('buildKnowledgeCql needs at least one usable term', () => {
  assert.equal(buildKnowledgeCql([]), null);
  assert.match(buildKnowledgeCql(['COM']), /title ~ "COM" OR text ~ "COM"/);
});

test('rankSimilarIssues orders by evidence and explains each match', () => {
  const source = { components: ['COM'], labels: ['memory'], keywords: ['buffer'], issueType: 'Bug' };
  const candidates = [
    { key: 'A-1', summary: 'Buffer sizing', components: [], labels: [], issueType: 'Task' },
    { key: 'A-2', summary: 'Unrelated', components: ['UI'], labels: [], issueType: 'Bug' },
    { key: 'A-3', summary: 'COM buffer overrun', components: ['COM'], labels: ['memory'], issueType: 'Bug' },
  ];
  const ranked = rankSimilarIssues(source, candidates);

  assert.deepEqual(ranked.map((issue) => issue.key), ['A-3', 'A-1']);
  assert.ok(ranked[0].matchedOn.includes('component: COM'));
  assert.ok(ranked[0].matchedOn.includes('label: memory'));
});
