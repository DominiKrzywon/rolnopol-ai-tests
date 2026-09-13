---
name: tech-debt-analysis
description: 'Prioritize improvements to the Rolnopol learning test framework using concrete code and run evidence. Use for repository health, recurring review issues, test maintenance, or choosing the next refactoring exercise; use code-review-advanced to assess a specific multi-file change.'
---

# A small framework improvement plan

Apply the [shared context](../CONTEXT.md).

## Workflow

1. Establish the scope and the user's problem. When asked for the next exercise,
   start with the upcoming steps in TEST_PLAN.md.
2. Compare the backlog with code, configuration, and available results.
   Do not suggest moving files again when they already have the correct suffix.
3. Look for concrete costs: misleading assertions, shared sessions, hidden cleanup
   failures, duplication that complicates changes, unused abstractions, or
   configuration that blocks a needed test.
4. Use the [short register](references/debt-register.md). Assess the impact
   on confidence, remediation risk, change size, and what the user will learn.
   Label estimates as estimates; do not invent percentage ROI.
5. Choose the next small step, its dependencies, and its verification.
   Separate a correction required for the current exercise from an intentional deferral.
6. Present the result in the conversation. When the task includes updating the roadmap,
   edit the relevant TEST_PLAN.md item instead of creating a second backlog.

## Assessment boundaries

The absence of unit tests, a new library, or another layer is not itself debt.
Show a concrete consequence. This repository is a test framework for learning;
do not assume a team, production incidents, or quarterly planning.
Do not automatically call an observed behavior in the educational application
an intentional defect introduced by its author.

## Done

The main proposals have evidence and verification methods. One next step
is a feasible exercise; the remaining proposals do not duplicate the roadmap.
