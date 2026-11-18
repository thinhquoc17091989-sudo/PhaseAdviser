# Automotive and embedded software checks

Use only when the issue concerns automotive or embedded software. These are prompts for what to look for, not facts about this team's system. Confirm each against the issue, similar issues and Confluence pages before stating it as a risk, and label unconfirmed ones as "worth checking".

## Memory

- Does the change add or grow RAM, ROM, NVM or stack use? Check the budget for the affected component and the margin left.
- Non-volatile data: block sizes, write cycles and wear, behaviour on power loss during a write, and compatibility of stored data after the change (layout migration).
- Buffers: sizes shared between producer and consumer, overflow handling, and alignment.

## Communication stack (COM, CAN, signal and PDU handling)

- Signal or PDU layout changes: byte order, scaling, initial and invalid values, timeout behaviour, and every receiving ECU.
- Timing: cycle times, transmission modes, bus load, and behaviour when a message is lost or late.
- Gateway routing and filtering rules affected by the change.

## Diagnostics and error handling

- New or changed fault conditions: debounce, healing, storage in event memory, and effect on service responses.
- Behaviour in degraded or safe states.

## Timing and concurrency

- Task and interrupt priorities, execution time budgets, shared-data protection, and worst-case latency.

## Safety and security

- Safety-related requirements affected: does the change need a re-assessment, and is the impact analysis recorded?
- Security: authentication or freshness of messages, key handling, and boot or update paths.

## Process (ASPICE-style)

- Is traceability kept: change request to requirement, design, code, test and review?
- Was the impact assessed before implementation, and is it reviewable?
- Are variant and configuration effects covered across all supported builds?
