# Generic phase checks

Use the section for the issue's current phase. These are fallback checks: prefer evidence from similar issues and pages, and label anything taken from here as a generic check.

## change-request

- Is the requested change and its reason stated, with an owner who can accept or reject it?
- Which components, interfaces and consumers does it touch? Compare with components on similar past issues.
- Did similar past changes to these components cause regressions, rework or late findings?
- What is the verification impact: which existing tests break, and which new ones are needed?
- Are the effort, risk and release timing realistic given what happened last time?

## development

- Are the acceptance criteria clear enough to know when the work is done?
- What did similar issues get wrong in implementation (root causes, resource limits, edge cases)?
- Do pages on this component state constraints the change must respect?
- Are dependencies on other teams, issues or releases identified?
- Is there a plan for how this will be tested before it is handed over?

## testing

- Which defects escaped to testing on similar issues, and what test would have caught them earlier?
- Are the cases that failed before covered: boundary values, error paths, restart or power-cycle behaviour, concurrency?
- Is the test environment close enough to production for the risk involved?
- Are regression tests planned for the components that changed?

## review

- Do reviewers know the past problems with this component, so they look at the right places?
- Is the change consistent with the constraints documented in Confluence?
- Are test results, impact analysis and documentation attached or linked?
- Which similar issues needed rework after review, and why?

## done

- Offer to help record a lesson: what went well, what went wrong, and what to check next time. Do not write it; suggest the text for the user to add.
