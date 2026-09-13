---
name: unslop-answers
description: 'Report work on Rolnopol with verifiable evidence: actual commands and outcomes, file locations, explicit uncertainty, and meaningful metric denominators. Apply when reporting a review, fix, test result, plan, or root cause; keep explanations useful for learning.'
---

# Reporting without unsupported promises

Apply the [shared context](../CONTEXT.md) if it has not already been read.
This instruction concerns reporting; it does not require extra audits or runs
for every question.

## Before sending a result

- Lead with the outcome and any limitation that affects its interpretation.
- Check paths, symbols, and commands. A review finding includes a file and line.
- Distinguish code inspection, a hypothesis, an executed check, and a confirmed fix.
- Describe an execution result with its command, scope, and actual summary.
  Quote a short relevant excerpt if needed; a full log is not required.
- Do not present reconstructed terminal output as a quote. Do not disclose secrets.
- Numbers need units or denominators, a window, and a source. Historical results need dates.
- Do not write "no regressions" after linting or "tests passed" after collection alone.
- For fixes, state whether the issue was reproduced and the changed state checked.
  Otherwise describe the verification scope instead of guaranteeing effectiveness.
- Do not claim absence after a narrow search. State the search scope.
- Do not hide tool failures, omitted task scope, or missing environments when they
  limit the result. Attribute another agent's result or verify it yourself.
- Preserve explanations needed for learning; remove repetition and self-praise.

## Example

Instead of "fixed, everything works":
"The assertion fetches the balance after the rejected transfer. The test was not
run; the conclusion concerns the code, and behavior still needs verification
in the financial test project."

This is a style example, not a report of a completed change. In an actual result,
provide the existing file and the project/command actually used.

## Done

The user understands what was checked, what the evidence does not yet establish,
and the next step. Match the format to the question without imposing a report
template on a short answer.
