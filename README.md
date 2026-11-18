# Phase Advisor — Codegeist 2026 handover

A Forge app with a Rovo agent that gives **phase-aware advice** on Jira issues (change request, development, testing, review), grounded in **similar past issues** and **Confluence knowledge**, so users learn from earlier problems at the moment they need it. Built for the Atlassian Codegeist 2026 hackathon. See [RULES.md](RULES.md) for the rules summary.

- **Deadline:** Tuesday 22 Dec 2026, 12:00 pm Pacific. Target: submit by **15 Dec**.
- **Category:** Apps for Specialized Industries (automotive), also relevant to Software Teams.
- **Bonus tracks aimed at:** Best Agents (`rovo:agent`, `rovo:skill`, `rovo:action`); Teamwork Graph if the integration is built; Marketplace and MCP are optional extras.

## Idea

Teams repeat mistakes because lessons sit in old tickets and pages. When someone works on an issue, the app tells them what to watch for **in the phase they are in**, citing the past issues and pages it used. Example for embedded automotive software: a change to the communication stack that touches non-volatile memory should surface earlier memory and timing problems on the same component.

### Existing apps (checked 18 Nov 2026, shallow search)

| App | What it does | Gap |
|---|---|---|
| WorkshopIQ (Marketplace) | Captures lessons from retros and post-mortems, shows related lessons on new tickets, Rovo-queryable | Generic; no development-phase logic or system model that I could find |
| Rovo Ops Expert (built in) | Similar incidents, PIRs and next steps | Aimed at incidents (JSM), not the development life cycle |
| Links Explorer, Ketryx | Traceability and change-impact views for ASPICE / ISO 26262 | Show what is linked, do not advise on what can go wrong |

## Decisions made

1. **No demo data ships with the app.** It works on whatever the user already has in Jira and Confluence. Judges will probably test on a generic software demo site, so output must be useful on generic history, with automotive depth when the data supports it.
2. **Phase is configurable.** Teams name statuses differently. v0.1 infers the phase from status names and says when it is guessing. A later admin screen maps statuses to phases.
3. **Evidence or silence.** Every point cites an issue key or page title. With no evidence the agent says so and falls back to generic phase checks. It never invents history.
4. **Domain knowledge lives in templates, not data.** Automotive checks (memory, COM stack, timing, diagnostics, safety, ASPICE) are a separate reference file the skill reads only when the issue looks automotive or embedded. Other domains can add their own.
5. **Read-only.** The agent never edits Jira or Confluence.
6. **Test with the existing seeded dev-site data first.** An automotive sample set can be added to the dev site later for the demo video only.
7. **Rovo has no memory between conversations**, so any stored lessons must live in app storage or Confluence, not in the agent.

## Design (version 0.1)

Forge manifest modules:

- `rovo:agent` "Phase Advisor": prompt says to advise by phase, cite evidence, never invent, never modify data. Uses one skill.
- `rovo:skill` `phase-advice`: SKILL.md workflow plus reference files: generic checks per phase, automotive checks, an answer template.
- Three read-only `action` modules, each backed by a function:
  - `get-issue-context`: issue fields plus the phase inferred from the status (inputs: issueKey, optional phase).
  - `find-similar-issues`: resolved issues sharing components, labels or summary keywords with the source issue, ranked, with the reason for each match (inputs: issueKey, optional keywords).
  - `search-knowledge`: Confluence pages about the issue's components or a given topic (inputs: issueKey or terms).
- Scopes: `read:jira-work`, `read:confluence-content.summary`, `search:confluence`. Runtime `nodejs24.x`.

Logic worth keeping (all unit-tested):

- **Phase inference:** first matching pattern on the status name wins, in this order: done, review, testing, development, change-request. Falls back to the status category (marked "not confident"), otherwise `unknown`. A user-stated phase overrides.
- **Search safety:** all search terms are sanitised to letters, digits, spaces, hyphens and underscores before going into JQL or CQL. If there is nothing to match on, no query is sent (never unbounded).
- **Similar-issue query:** resolved issues only, excluding the source issue, matching components OR labels OR summary keywords. Uses `POST /rest/api/3/search/jql`.
- **Ranking:** component match 3 points, label 2, each keyword 1, same issue type 1. Only issues with at least one match are returned, with a `matchedOn` list.
- **Knowledge search:** CQL on page title or text for each term, via the Confluence search REST endpoint.

## Plan to the deadline

| Week | Work |
|---|---|
| 1 (to 24 Nov) | Scaffold and register the app; first deploy and install on the dev site; test the agent on seeded issues |
| 2 | Phase-aware advice end to end; Jira issue panel; fix issues found in testing |
| 3 | Teamwork Graph integration; read component constraints from Confluence pages; empty-data fallback |
| 4 | Admin screen for status-to-phase mapping; test on several seeded projects and on a fresh install via the install link |
| 5 (to 15 Dec) | Video under 5 minutes, write-up, setup instructions, submission |

## Status (18 Nov 2026)

- Done: dev site provisioned, Forge CLI and Atlassian access set up, app scaffolded, registered, lint clean, 10 unit tests passing.
- **Blocked:** `forge deploy` from the company laptop is blocked by the corporate proxy's data-loss-prevention policy (the upload to Forge's storage returns 403). Deploying needs a permitted machine or an exception from IT.
- Not built yet: status-to-phase admin screen, Jira issue panel, Teamwork Graph integration, lesson capture.

## Setting up on another computer

1. Install Node.js 20 or later.
2. `npm install -g @forge/cli`
3. Create an API token at https://id.atlassian.com/manage-profile/security/api-tokens, then `forge login` (email and token) and `forge whoami`.
4. `forge site provision` shows the development site for the account (free, 90 days). Use the same site for all apps.
5. In the app folder: `npm install`, `forge register` (only if the app is not yet registered to this account), `forge lint`, `forge deploy -e development`, `forge install --demo-site`.
6. Test in Rovo Chat on a real issue: "What should I watch out for on this issue?"

## Open questions

- May the entry be built on a company laptop and submitted as the entrant's own work? The rules require the entrant to solely own it; check employer IP terms first.
- If the Atlassian account is tied to an employer email with single sign-on, the API token may not be creatable off the company network. A personal Atlassian account avoids this (needs a new `forge register` and dev site).
- The Teamwork Graph API surface to use from Forge is still to be checked in the Forge documentation.

## Useful links

- Hackathon: https://codegeist2026.devpost.com
- Forge getting started: https://developer.atlassian.com/platform/forge/getting-started/
- Forge Rovo sample apps: https://developer.atlassian.com/platform/forge/example-apps-rovo/
- Distribute apps for testing: https://developer.atlassian.com/platform/marketplace/distributing-your-apps/
