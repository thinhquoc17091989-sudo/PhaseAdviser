# Codegeist 2026 — rules summary

This is a **summary** for planning, written from the official rules on 18 Nov 2026. The official rules on https://codegeist2026.devpost.com always take precedence.

## Dates (Pacific Time)

| Event | Date |
|---|---|
| Registration and submissions | 27 Oct 2026, 9:00 am – **22 Dec 2026, 12:00 pm** |
| Judging | 5 Jan 2027, 1:00 pm – 3 Feb 2027, 5:00 pm |
| Winners announced | around 15 Feb 2027 |

No changes to a submission are allowed after the deadline.

## Who can enter

Individuals at the age of majority where they live, teams (one authorised Representative submits) and organisations. Not eligible: residents of countries under US sanctions or where local law prohibits it (the rules list Brazil, Quebec, Russia, Belarus, Crimea, Cuba, Iran, North Korea, Syria, Sudan, Myanmar); people on US denied-party lists; the Sponsor (Atlassian) and Administrator (Devpost), their employees, agents, family and household members; judges and their employers; affiliates of those; anyone whose participation would create a real or apparent conflict of interest.

## What to build

A **Forge** app that integrates with at least one of: Jira, Confluence, Jira Service Management, Bitbucket, Teamwork Graph, Rovo.

- New, or an existing app **updated or rebuilt on Forge after 27 Oct 2026**, with a Forge manifest and at least one Forge module.
- Must install in a judge's test environment through an **installation link**, run consistently and work as shown in the video and description.
- Third-party SDKs, APIs and data must be used within their terms.
- Must be the entrant's **original work, solely owned by the entrant**, not violating anyone's IP. Open source is allowed if licences are followed and the entry builds on it.
- Must not have been built with financial or preferential support from the Sponsor or Administrator.

### Categories (pick one)

1. Apps for Software Teams — context to ship with confidence (code review, deployment awareness, triage).
2. Apps for Business Teams — marketing, sales, HR, finance, support, legal.
3. Apps for Specialized Industries — healthcare, finance, manufacturing, automotive and others.

### Bonus prizes (pick any that apply)

| Bonus | Requirement |
|---|---|
| Best Agents | Forge app using `rovo:agent`, `rovo:agentConnector`, or reusable `rovo:skill` / `rovo:action` modules other agents can invoke |
| Best app with Atlassian MCP | Forge app exposing tools through the Atlassian MCP server with the `rovo:mcp` module (can be combined with open-source `skill.md` files) |
| Best Teamwork Graph integration | Connects data into the graph and/or consumes the Teamwork Graph API |
| Best Marketplace published app | Published to the Marketplace or submitted for listing; give the listing link or the review ticket link |

The Sponsor may move an entry to a different category or bonus.

## What to submit

- The project, built with Forge.
- A **demo video under 5 minutes**, public on **YouTube**, showing the app working on the device it was built for. No third-party trademarks or copyrighted music or material without permission. Judges need not watch past five minutes.
- An **installation link** for judges (create it by following "start sharing your app" in the Forge distribution docs).
- **Setup instructions** for a judge's environment, covering every configuration step and integration.
- A text description of features and functionality.
- An explanation of how the project meets the Forge requirement.
- The chosen category and bonus prizes, with a write-up for each bonus.
- All materials in English (or with an English translation).

Several submissions are allowed if each is unique and substantially different.

## Judging

- **Stage 1 (pass/fail):** reasonably fits the theme and reasonably uses the required APIs and SDKs.
- **Stage 2 (equal weight):**
  1. Technological Implementation — a genuine, working, non-trivial app when tested, not a shallow wrapper or a single hardcoded demo path.
  2. Design — a complete, coherent product experience.
  3. Potential Impact — a credible, specific case for a real problem and audience.
  4. Innovation / Idea — creative, novel, different from existing concepts.
  5. Presentation — the video shows the app working end to end and explains the problem, the audience and why it matters.
- Ties are broken by the highest score on the first criterion above, then the next, then a judges' vote.

## Prizes

| Prize | Amount | Winners |
|---|---|---|
| First place | $15,000, 2 tickets to Team 2027 (AMER, travel not included), Atlassian blog recognition, signed Atlassian Williams Racing swag | 3 (one per category) |
| Second place | $8,000 | 3 (one per category) |
| Third place | $5,000 | 3 (one per category) |
| Each bonus prize | $1,500 | 6 per bonus |
| Participation | Atlassian developer swag pack (first 300 eligible entrants, max 4 per submission) | up to 300 |

One submission can win at most one grand prize and one bonus prize. Winners are subject to identity and role verification, tax forms (W-9 or W-8BEN) and may have taxes withheld.

## Other conditions worth knowing

- Atlassian and Devpost may use the entrant's name, likeness and the submission for promotion for three years.
- Entering means agreeing to the rules, binding arbitration (AAA, New York law), and a release of the Sponsor and Administrator.
- Use of the developer tools is subject to the Atlassian developer terms.
- Questions: support@devpost.com. Developer help: Atlassian Developer Community, tag `codegeist-2026`.
