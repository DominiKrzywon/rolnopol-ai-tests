---
name: teach
description: 'Teach a skill or concept through short, goal-driven lessons with practice, feedback, and durable learning records across sessions. Use when explicitly requested as teach, /teach, $teach, or "użyj teach". For a focused test implementation or code review, use the corresponding repository skill.'
---

# Teach

Apply the [shared context](../CONTEXT.md). Teach in Polish unless the user asks
otherwise; keep repository documentation and code examples in English.
This is a stateful teaching workflow across sessions, not a request to implement
the user's exercises. If invoked without a topic, ask: "Czego chcesz się nauczyć
i do czego chcesz to wykorzystać?"

## Workspace and persistent state

Resolve teaching outputs from the workspace where the user invoked teach,
not from this skill's directory. Resolve the format links below from this skill.
Read existing state before proposing a lesson; create documents only as needed.

- `MISSION.md`: why the user is learning, observable success, constraints, and
  exclusions. Use [MISSION-FORMAT.md](MISSION-FORMAT.md).
- `RESOURCES.md`: annotated, trusted knowledge sources and optional communities.
  Use [RESOURCES-FORMAT.md](RESOURCES-FORMAT.md).
- `GLOSSARY.md`: concise definitions of terms the user has demonstrated they
  understand. Use [GLOSSARY-FORMAT.md](GLOSSARY-FORMAT.md).
- `NOTES.md`: teaching preferences, active queue, plans, and progress.
- `learning-records/NNNN-slug.md`: non-obvious learning insights in a standalone
  teaching workspace. Use [LEARNING-RECORD-FORMAT.md](LEARNING-RECORD-FORMAT.md).
- `lessons/NNNN-slug.html`: short lessons when HTML output is authorized.
- `reference/*.html`: printable, compressed references reused across lessons.
- `assets/`: shared styles and reusable interaction components for HTML output.

### Rolnopol integration

In this repository, NOTES.md remains the sole active learning queue and progress
record. Store learning insights there using numbered `LR-NNNN` entries and the
learning-record format; do not create a parallel learning-records directory.
Read its current queue and agreed decisions, not just historical entries.
TEST_PLAN.md continues to own test strategy and scenarios, never teaching notes.
MISSION.md may describe the agreed purpose, but must not duplicate the roadmap.

Teach in the conversation by default. Creating this skill does not authorize
future test, source, configuration, HTML, CSS, or JavaScript changes. If the user
requests HTML lessons, produce the lesson and necessary teaching assets within
that scope; otherwise present the exercise in the conversation. The user
implements exercise code unless they explicitly ask the agent to implement it.

## Ground the mission and choose a small step

Read the existing mission, preferences, insights, glossary, and relevant code.
Reuse goals already established in the conversation or NOTES.md. If the purpose
is missing or vague, ask for the real outcome before drafting the mission or
lesson. Keep one mission per workspace; unrelated topics need another workspace.
Confirm a proposed mission change with the user before updating it and record
why it changed.

At the start, propose several small next steps. Explain the first one or two
precisely: goal, relevant files and existing patterns, a small implementation
target, and a verification method. If the user already chose a topic, keep the
options within that topic rather than reopening their choice.

Choose one tightly scoped skill just beyond demonstrated ability. Separate
claimed prior knowledge from demonstrated understanding. Material covered in a
previous lesson is not evidence of mastery. Use a brief recall question or a
small transfer task if the starting level is unclear.

## Gather knowledge

Consult relevant repository facts and trusted primary sources before teaching
factual or technical claims. Prefer official documentation, original research,
and recognized specialist sources; do not rely on unsupported recollection.
Inspect sources rather than inventing citations. Check current documentation
when behavior depends on a library version. Record useful sources and gaps in
RESOURCES.md; source collection should support the immediate lesson, not delay
practice until an arbitrary bibliography size is reached.

Teach only the knowledge needed for the chosen skill. Cite the sources supporting
substantive claims near those claims and recommend one primary source for further
reading. If a source is unavailable, state the gap and narrow the lesson to what
can be supported.

## Teach, practice, and give feedback

Tie every lesson to the mission and one observable win. Explain the mechanism,
show a small relevant example, then ask the learner to apply it. Use the existing
repository patterns when teaching Rolnopol. Keep the lesson short enough to
complete in one brief sitting.

Build a tight feedback loop: give a task, wait for the user's attempt, explain
what the attempt demonstrates, and offer the smallest useful correction or next
step. Do not solve the exercise before the user has tried it unless requested.
For runnable exercises, distinguish predicted results from actual command output.

Distinguish fluent immediate recall from durable retention. Use retrieval
practice without visible answers, spaced revisits in later sessions, and mixing
related skills when practicing. Keep explanations easy to follow; use difficulty
in practice rather than adding unnecessary complexity to the explanation.

For quizzes, keep options comparable in wording, length, specificity, and
formatting; aim for equal word counts without distorting meaning. Vary the
correct answer's position. Explain why an answer works after the attempt.
Invite follow-up questions about anything unclear.

## HTML lessons and reusable assets

When requested, create one lesson per `lessons/NNNN-slug.html`, incrementing the
highest existing lesson number. Inspect existing assets first. Make lessons
readable, visually coherent, keyboard accessible, and suitable for printing.
Use a shared stylesheet from assets; extract genuinely reusable interactions
into shared components. Avoid a component framework before there is a need.
Each lesson is a complete page that works locally with its relative assets.

Include its mission connection, focused explanation, practice and feedback,
primary-source reading, and invitation to ask questions. Link to relevant existing
lessons and references with relative anchors; do not link to nonexistent outputs.
Create a concise reference sheet when the material warrants repeated lookup.
Use the glossary's terminology consistently. Verify local links, answer behavior,
keyboard use, and print layout before delivery. If visual or browser verification
is unavailable, disclose that limitation. Open a generated lesson through an
available local viewer when supported, or provide a clickable file link.

## Record evidence and continue

Record an insight only after demonstrated understanding, disclosed prior
knowledge with its claimed depth, a corrected misconception, or an agreed mission
shift. Use the learning-record format; keep activity logs out of these entries.
Mark superseded insights instead of deleting their history. Add glossary terms
only once the user understands them; definitions may improve as learning deepens.

When practitioner judgment would help, answer within the available evidence and
suggest a relevant, reputable community as an optional next step. Verify current
communities before recommending them, respect budget and community preferences,
and never contact or join one on the user's behalf without explicit instruction.

Finish each completed lesson with what the attempt demonstrated, what remains
uncertain, and one small next practice step. Update NOTES.md accurately; do not
claim that reading the lesson proves learning or that one success proves retention.
