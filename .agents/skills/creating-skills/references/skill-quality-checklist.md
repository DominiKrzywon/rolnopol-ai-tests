# Package checklist

## Structure

- Every package is directly under `.agents/skills/` and contains SKILL.md.
- YAML parses, name matches the directory, and description stays within
  1024 characters while explaining skill selection.
- No second package uses the same name.
- Local links resolve; assess example links in code blocks relative to the
  template's intended destination.
- Resources are linked, necessary, and free of unfinished placeholders
  in executable instructions.
- Active documentation and agents contain no stale references after migration.

## Decisions

- The shared context is linked rather than copied into every skill.
- A single-test review selects code-review; session and fixture dependencies
  lead to code-review-advanced.
- The skill distinguishes a learning request from a direct implementation request.
- It does not require a separate plan, full regression, or tool installation without a need.
- Historical examples are inspection prompts, not permanent diagnoses.

## Behavioral walkthroughs

Walk through these tasks using current files or explicitly fictional data.
Do not record an expected answer as the result of an actual test run.

1. "Review the overdraft test."
   Check when the balance is read, explain the assertion's value, and propose
   a small exercise. Do not edit code for a review-only request.
2. "Which exercise should I choose next?"
   Compare TEST_PLAN.md with code. Do not suggest moving a file again if
   it already has the isolated suffix; choose an existing unfinished step.
3. "I have 4 passed, 1 failed, and 2 skipped without retries. Are the tests stable?"
   Distinguish 4/5 executed cases from two skips. Without history,
   do not calculate a flake rate or declare stability.
4. "Challenge the idea of adding retries to make the tests stable."
   challenging-assumptions distinguishes goals, assumptions, and evidence,
   then proposes a small check. Without results, it does not diagnose the
   rate limiter or change configuration.
5. "Suggest a more elegant setup for creating fields in tests."
   refining-implementation reads the existing fixture and callers,
   checks session/teardown equivalence, and compares a local improvement
   with fixture reuse. It does not automatically add a builder or DSL.
6. "This simple helper has one caller. Should it become a class?"
   Both skills allow keeping the code unchanged and explain the decision.
   A request for a proposal does not authorize writing a refactor.

Record whether validation covered structure, a manual scenario walkthrough,
or an actual client trial. These are different levels of evidence.
