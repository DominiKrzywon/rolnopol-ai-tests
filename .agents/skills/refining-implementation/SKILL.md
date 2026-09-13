---
name: refining-implementation
description: 'Analyze an existing Rolnopol implementation and propose a more deliberate, readable alternative when the user asks for a cleaner or more elegant design, simplification, or relief from tangled AI-generated code. Compare concrete options without speculative abstractions; ordinary review does not require this workflow.'
---

# A clearer, more deliberate implementation

Apply the [shared context](../CONTEXT.md).
Use when asked for a better implementation approach. For ordinary review,
leave scope selection to the review skills. A request for analysis or a proposal
does not authorize a refactor; a direct implementation request authorizes the change.

Judge elegance by explicit data flow, appropriate responsibilities, ease of
diagnosis, and the cost of the next change. Fewer lines are not a sufficient
criterion on their own. Keeping the existing solution is an acceptable outcome.

## Workflow

1. Read the selected code, its callers, tests, and requirements. Establish inputs
   and outputs, side-effect order, error handling, and resource lifecycles.
   Separate current behavior from the agreed contract.
2. Identify a concrete comprehension cost: jumping between helpers, hidden I/O,
   flags that change a function's meaning, nested branching, unclear names,
   or mixed setup and assertions. Provide the location and consequence.
   Do not judge code based on whether a person or AI wrote it.
3. Establish what must be preserved: tested behavior, user isolation, diagnostics,
   cleanup, and repository layer rules. Identify bug fixes separately;
   do not describe a contract change as a behavior-preserving refactor.
4. Compare current code, a small local improvement, and one recommended alternative.
   If the local improvement is sufficient, it can be the recommendation;
   do not invent another variant without a concrete benefit.
5. Show a short, coherent proposed code fragment with real imports and the required
   helpers. Mark new symbols as proposed. If the fragment is pseudocode or omits
   setup, say so; do not call it ready to run.
6. Explain why the option is easier to read, what it costs, and when not to choose it.
   For a new abstraction, identify actual consumers or an existing responsibility
   boundary and its benefit over an ordinary function.
7. Propose one small migration step and a way to verify behavioral equivalence.
   When implementation is requested, make the change and run the shared-context
   checks; for analysis only, leave the repository code to the user.

## Selection criteria in this repository

- Prefer readable functions, concrete types, and named data; use generics when
  they represent a real shared relationship rather than potential future needs.
- Keep scenario assertions in specs and the Arrange–Act–Assert sequence visible.
- Reuse an existing fixture when its resource lifecycle fits.
  Do not replace a few setup lines with a new class hierarchy without a demonstrated benefit.
- Do not hide login, retries, or cleanup behind an innocent helper name.
  Reading state before the action must not replace reading it afterward.
- For API tests, preserve raw response access when the test needs to assert 4xx.
  Unifying clients must not remove the ability to assert errors.
- Do not remove meaningful assertions or diagnostics to shorten a test.
- A new dependency, builder, DSL, class factory, or extra layer needs a concrete
  problem that existing tools cannot solve clearly.

## Response format and completion

Explain the current cost, show the recommendation and code fragment, then describe
the trade-off and verification. Use a short comparison table for larger decisions.
Do not claim speed or reliability improvements without measurements.

Analysis example: for repeated field creation in specs, compare local setup with
the existing [data.fixture.ts](../../../src/fixtures/data.fixture.ts).
Check parameters, sessions, and teardown first; similar calls alone do not prove
that the implementations are interchangeable.

Done means the alternative has a demonstrated benefit, preserves required behavior,
and can be explained without describing another framework. If the current option
is the clearest, justify keeping it.
