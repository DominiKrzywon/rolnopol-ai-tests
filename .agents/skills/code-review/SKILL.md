---
name: code-review
description: 'Review a small Rolnopol Playwright or TypeScript exercise, single file, or focused diff. Explain correctness and assertion problems with evidence and a small next step. Use code-review-advanced for cross-file dependencies, shared fixtures, session changes, or suite-wide review.'
---

# Review a single exercise

Apply the [shared context](../CONTEXT.md).
This skill also covers a single automated test; using Playwright alone
does not require a broader review.

## Workflow

1. Establish the change's intent and read the file together with its directly
   used helper or fixture. Separate the new change from pre-existing problems.
2. Check whether the test can detect a violation of the described behavior:
   - the assertion examines the outcome after the action, not a previously saved value;
   - negative validation checks the rejection reason and relevant side effects;
   - the test uses its own data, the correct session, and cleans up its resources;
   - waiting is tied to an event or state rather than a fixed delay;
   - Page Objects, AAA, and locators follow repository standards;
   - the static case ID matches its TEST_PLAN scenario and parameterized cases
     have distinct IDs; a passing result does not establish assertion quality.
3. When correctness depends on several projects, shared authentication,
   or fixture lifecycles, use
   [code-review-advanced](../code-review-advanced/SKILL.md).
4. Present the main findings as:
   location → problem → consequence → smallest correction.
   Distinguish a test defect from an optional simplification.
5. Finish with one next exercise and its verification method.
   For PR review, add `approve`, `comment`, or `request changes`;
   for learning, explaining what to improve and why is sufficient.

## Reasoning example

In [financial.isolated.spec.ts](../../../tests/auth/financial.isolated.spec.ts),
check when the balance is fetched relative to the rejected transfer.
If the final assertion uses a value from before the action, explain the difference
between verifying setup and verifying an outcome. This is an inspection prompt,
not a permanent diagnosis: read the current code first.

## Done

Findings have locations and behavioral impact, the suggestion fits the exercise,
and the report distinguishes inspection from execution results.
Do not edit files when the request is only for review.
