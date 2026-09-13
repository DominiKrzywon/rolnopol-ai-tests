---
name: code-review-advanced
description: 'Review multi-file Rolnopol test changes, shared fixtures, authentication, API helpers, project configuration, or suite reliability. Trace dependencies and rank evidence-backed findings by their effect on test confidence. Use code-review for a small isolated exercise.'
---

# Review dependencies and test confidence

Apply the [shared context](../CONTEXT.md).
Reserve broader analysis for changes that cannot be assessed within one file.

## Workflow

1. Define the scope: a diff, a selected module, or a test suite. State the expected
   behavior and exercise constraints. Do not expand the review to the entire
   repository merely because the change involves authentication or finance.
2. Trace the flow: spec → fixture/actions → Page Object or API helper
   → session and environment. Check the changed helper's callers and the projects
   that use it. Read configuration from the current files.
3. Use the [dependency checklist](references/review-checklist.md).
   Assess correctness, assertion quality, isolation, layer boundaries, diagnostics,
   and execution cost. Examine security where a concrete data or permission issue
   exists; do not add a general application audit.
4. For each significant finding, record:
   priority, file and line, evidence, impact, smallest correction, and verification.
   Combine repeated findings with the same cause.
5. For scenario mappings or reporting changes, verify ID uniqueness, catalog scope,
   README generation, source freshness, partial runs, and setup separation using
   the standalone coverage commands documented in README.
   Select checks using the shared context. Inspection can expose an ineffective
   assertion; it does not prove that the application is defective or the test is flaky.
6. Finish with the main findings and a sequence of small changes. When a backlog
   is needed, connect improvements beyond the review scope to TEST_PLAN.md through
   [tech-debt-analysis](../tech-debt-analysis/SKILL.md).

## Priority and outcome

- High: a test may falsely confirm critical behavior, affect someone else's data,
  or disrupt other tests' sessions; show the concrete mechanism.
- Medium: a significant gap in diagnostics, the contract, or maintainability.
- Low: a limited simplification or readability improvement; do not present it as a blocker.

A finding's priority is not the plan's `@p0` test tag.
For PR review, finish with `approve`, `comment`, or `request changes`
and the evidence limitations. In learning mode, propose the next exercise.
Point out a valuable part of the solution when it helps explain the correction;
do not add a mandatory list of compliments.

## Done

The dependencies relevant to the scope have been traced, findings are ordered
by impact, and the result distinguishes code inspection, hypotheses, and execution.
Keep the report in the conversation unless the user requests a separate document.
