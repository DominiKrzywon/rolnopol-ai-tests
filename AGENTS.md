# Rolnopol repository instructions

Read [.agents/skills/CONTEXT.md](.agents/skills/CONTEXT.md) for the shared learning
mode, repository sources and verification rules before working on this project.
Task-specific procedures live only in [.agents/skills](.agents/skills).
Use the [skill catalog](README.md#agent-skills) to choose a relevant procedure.

## Learning collaboration preferences

- Before planning tests, exercises or refactors, read
  [coding standards](docs/CODING_STANDARDS.md). Keep the main behavior readable
  and check existing scenario coverage before adding assertions.

- Keep the active learning queue, refactoring plans and progress records in
  `docs/NOTES.md`, outside the coverage report. `docs/TEST_PLAN.md` owns test strategy and scope;
  `docs/TEST_CASES.md` owns the scenario catalog; do not add mentor notes there.
- During test exercises and reviews, the agent maintains `docs/TEST_CASES.md`,
  chooses or preserves the case ID, and synchronizes the spec's case metadata.
  Run `npm run coverage:validate` and give the learner the case ID, test title,
  and spec filename. The learner owns the exercise's test logic.

- Preserve the agreed Marketplace purchase cleanup. Do not propose its refactor
  or fault-injection exercises in routine reviews; see the
  [recorded decision](docs/NOTES.md#agreed-decision-keep-marketplace-purchase-cleanup).

- Do not change test, source, configuration, or other non-Markdown files unless
  the user explicitly asks for that implementation. Review, diagnosis, and
  verification are allowed without that request.
- The agent may edit Markdown documentation on its own, without asking for
  separate permission, when the change accurately records an agreed plan,
  result, or learning preference. Keep test, source, configuration, and other
  non-Markdown changes under the explicit implementation rule above.
- Prefer a focused test run for the changed scenario. Run a broader project or
  suite only when a shared fixture, configuration, or other concrete impact
  warrants it; report the verification scope.
- At the start of a learning task, propose several small next steps and explain
  the first one or two precisely: the goal, relevant files and existing
  patterns, a small implementation target, and how the user can verify it.
  The user implements code changes and can then ask for a review.
