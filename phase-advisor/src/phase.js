export const PHASES = ['change-request', 'development', 'testing', 'review', 'done'];

// Order matters: the first matching pattern wins, so "In Review" is a review
// status even though a later pattern could match other words in the name.
const STATUS_PATTERNS = [
  ['done', /\b(done|closed|resolved|released|complete\w*|cancel+ed)\b/i],
  ['review', /\b(review|approv|accept|sign[- ]?off)\w*/i],
  ['testing', /\b(test|qa|verif|validat|integrat)\w*/i],
  ['development', /\b(progress|develop|implement|coding|build)\w*/i],
  ['change-request', /\b(change|request|triage|backlog|new|open|to ?do|analy|impact|refine|select)\w*/i],
];

/**
 * Infers the development phase of an issue from its workflow status.
 * Workflows differ per team, so the result states where it came from and the
 * Agent is told to confirm with the user when it is only a guess.
 */
export function inferPhase({ statusName = '', statusCategoryKey = '', override } = {}) {
  if (override && PHASES.includes(override)) {
    return { phase: override, source: 'stated by the user', confident: true };
  }

  for (const [phase, pattern] of STATUS_PATTERNS) {
    if (pattern.test(statusName)) {
      return { phase, source: `inferred from status name "${statusName}"`, confident: true };
    }
  }

  if (statusCategoryKey === 'done') {
    return { phase: 'done', source: 'inferred from the Done status category', confident: true };
  }
  if (statusCategoryKey === 'new') {
    return { phase: 'change-request', source: 'inferred from the To Do status category', confident: false };
  }
  if (statusCategoryKey === 'indeterminate') {
    return { phase: 'development', source: 'inferred from the In Progress status category', confident: false };
  }

  return { phase: 'unknown', source: `status "${statusName}" does not map to a known phase`, confident: false };
}
