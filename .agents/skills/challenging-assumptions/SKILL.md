---
name: challenging-assumptions
description: 'Challenge assumptions behind a Rolnopol test, design, plan, or proposed approach. Use when the user asks for pushback, counterarguments, weak spots, or a critical second opinion. Examine the premises and trade-offs; use code-review for ordinary code correctness feedback.'
---

# Challenging assumptions

Apply the [shared context](../CONTEXT.md).
Be a demanding discussion partner: challenge decisions and their rationale
while respecting the author. The goal is a better decision, not a fixed number of objections.

## Workflow

1. State the user's goal and present the strongest case for the current approach.
   Distinguish requirements, deliberate trade-offs, assumptions, and unknowns.
   Label assumptions inferred by you as interpretations.
2. Read the material needed for assessment: the proposal, relevant plan item,
   code, and direct dependencies. Do not turn a question about one test into a repository audit.
3. Select assumptions whose failure would materially change the decision.
   For each, provide evidence or identify its absence and give a concrete
   counterexample: when would the approach stop meeting the goal?
4. Examine the cost of both choices: what is gained, complicated, or given up?
   Include learning value. Intentional duplication during learning can be justified,
   while another abstraction may make a test harder to understand.
5. Propose the smallest experiment or check that resolves the disagreement.
   Describe possible outcomes and their effect on the decision. Do not change
   the application or run data experiments outside the agreed scope.
6. Finish with a position: keep, change, or gather specific evidence.
   State which result would change your opinion.

## Useful questions in Rolnopol

Select only questions relevant to the decision:

- Does a passing test prove a requirement or merely reproduce current behavior?
- Was state measured after the action, or are we assuming no side effects?
- Does a second UI test address a different risk from the existing API contract?
- Do a shared account or more workers preserve session independence?
- Do retries remove the cause or only change the visible outcome?
- Does a helper clarify the scenario or merely reduce line count?

## Response format

Main assumption → source or location → counterargument →
consequence → check → recommendation.
For an idea without code, quote the user's premise; do not invent a file and line.
Distinguish demonstrated problems, conditional risks, and optional preferences.

Example: for "add retries to make the tests stable," inspect available failure
history and configuration. Retries can help reveal mixed outcomes, but a pass
after retry does not explain their cause. Without runs, do not claim that the
rate limiter is responsible.

## Boundaries and completion

Do not manufacture objections. When an assumption is well supported, explain why.
You may question the value of an existing convention, but do not override agreed
requirements or exclusions without the user's decision. Do not edit code for
an opinion-only request. Do not require permission again for an implementation
that has already been requested.

Done means the critique leads to a decision or a small check rather than a generic
list of concerns. If the user then wants a concrete code alternative, use
[refining-implementation](../refining-implementation/SKILL.md).
