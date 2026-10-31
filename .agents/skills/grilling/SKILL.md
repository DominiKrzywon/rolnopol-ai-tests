---
name: grilling
description: 'Interview the user in Polish, round by round, to stress-test a plan, decision, or idea until its material decisions are settled. Use for requests such as "seria grillowania", "grilluj mnie", "przegrilluj mój plan", "grill me", or "grill-me". Use challenging-assumptions for a standalone critique rather than an interactive interview.'
---

# Grilling

Apply the [shared context](../CONTEXT.md). Conduct the interview in Polish:
questions, titles, recommendations, follow-ups, and the closing summary.
Be demanding about reasoning and evidence while respecting the user.

## Build the decision tree

Establish the plan, decision, or idea being examined and its goal from the
conversation. If no subject was supplied, ask for it in Polish before starting.
Map the subject as a design tree: each decision branches into the decisions
that depend on it. Keep track of settled choices, open questions, dependencies,
and facts still being investigated. Cover material branches within the agreed
scope; do not expand the interview into unrelated hypothetical decisions.

## Work in rounds

The frontier contains every open decision whose prerequisites are already
settled. Ask the entire current frontier in one round, numbering questions
continuously across rounds and giving a concrete recommended answer for each.
A question that depends on another unanswered question belongs to a later round.

Use this format, with Polish content:

```text
❓ **Q1** - **Zakres**: Czy przyjmujemy, że analizujemy tylko scenariusz zakupu na Marketplace?

➡️ Rekomenduję skupić tę sesję na scenariuszu zakupu na Marketplace.

---

❓ **Q2** - **Kryterium sukcesu**: Czy uznajemy plan za gotowy, gdy każda istotna decyzja ma uzasadnienie i sposób weryfikacji?

➡️ Rekomenduję wymagać uzasadnienia i sposobu weryfikacji dla każdej istotnej decyzji.
```

Word each question so that "tak" accepts its recommendation. Explain the
relevant trade-off and alternatives when they help the user decide. A
recommendation is not an accepted decision until the user answers.

Wait for the user's answers before the next round. Interpret a numbered
answer against its question; if a bare "tak" could refer to several questions,
clarify its scope. Keep unanswered decisions open. Resolve contradictions
before asking questions that depend on them.

After each answer, update the tree and recompute the frontier. Follow up on
unsupported reasoning, concrete failure cases, and trade-offs that could change
the decision. Do not manufacture objections to choices supported by evidence.

## Find facts; ask for decisions

Finding facts available in the repository or tools is the agent's job.
Do not ask the user for information you can inspect yourself. Distinguish
observations from hypotheses; ask for unavailable context when it matters.
The user owns decisions about goals, priorities, scope, and accepted trade-offs.

When an open decision needs investigation and delegation is available and
permitted, dispatch a sub-agent with a fresh context and only the task and
relevant sources. Request facts and evidence, not decisions on the user's behalf.
Treat a running investigation as an unsettled prerequisite: defer its dependent
questions and ask the rest of the frontier now. If delegation is unavailable,
inspect the relevant sources directly and retain the same dependency ordering.
Keep investigation within the shared context's environment and data boundaries.

## Finish with shared understanding

When the frontier is empty, summarize the goal, agreed decisions, rationale,
accepted trade-offs, and verification criteria in Polish. Disclose any remaining
unknowns; a material unknown keeps its branch open unless the user explicitly
decides to accept that uncertainty.

Ask: "Czy to podsumowanie trafnie oddaje nasze wspólne ustalenia?"
Wait for confirmation; reopen affected branches if the user corrects it.
Do not implement the discussed plan during the interview. Confirmation of
shared understanding does not itself request implementation. Once the user
requests implementation, follow that authorization and repository rules.
