# Agent skills

All project skills are maintained in [.agents/skills](../.agents/skills).
The [shared context](../.agents/skills/CONTEXT.md) defines mentoring mode,
repository sources, and verification scope. TEST_PLAN.md owns strategy and scope;
TEST_CASES.md owns the scenario catalog. Personal learning notes are maintained locally.

| Skill                                                                                         | Purpose                                                                      |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [code-review](../.agents/skills/code-review/SKILL.md)                                         | Review a single exercise or small diff                                       |
| [code-review-advanced](../.agents/skills/code-review-advanced/SKILL.md)                       | Review dependencies, fixtures, sessions, and multiple files                  |
| [challenging-assumptions](../.agents/skills/challenging-assumptions/SKILL.md)                 | Challenge assumptions, offer counterarguments, and propose small experiments |
| [refining-implementation](../.agents/skills/refining-implementation/SKILL.md)                 | Propose a clearer implementation without unnecessary abstractions            |
| [playwright-test-automation](../.agents/skills/playwright-test-automation/SKILL.md)           | Design and implement UI/API tests                                            |
| [playwright-cli](../.agents/skills/playwright-cli/SKILL.md)                                   | Optional browser exploration                                                 |
| [static-code-analysis-typescript](../.agents/skills/static-code-analysis-typescript/SKILL.md) | Maintain existing TypeScript, ESLint, Prettier, and CI checks                |
| [tech-debt-analysis](../.agents/skills/tech-debt-analysis/SKILL.md)                           | Prioritize small framework improvements                                      |
| [analyzing-quality-metrics](../.agents/skills/analyzing-quality-metrics/SKILL.md)             | Interpret outcomes, duration, and repeatability                              |
| [unslop-answers](../.agents/skills/unslop-answers/SKILL.md)                                   | Report work using actual evidence                                            |
| [creating-skills](../.agents/skills/creating-skills/SKILL.md)                                 | Maintain and validate skill packages                                         |
| [grilling](../.agents/skills/grilling/SKILL.md)                                               | Interview in Polish through dependent rounds of decisions                    |
| [teach](../.agents/skills/teach/SKILL.md)                                                     | Explicit teaching sessions with practice, feedback, and durable insights     |

Example requests:

- "Użyj teach: chcę nauczyć się walidacji odpowiedzi API."
- "Zrób serię grillowania mojego planu z użyciem grilling."
- "Review the overdraft test."
- "Use challenging-assumptions: challenge my idea of sharing an account across tests."
- "Use refining-implementation: analyze this helper and show a clearer alternative."
- "Choose the next exercise from the plan."
- "Interpret the test results."

Requests for learning, review, assumption challenges, or solution proposals use
mentoring mode. A direct implementation request authorizes the change.
Select refining-implementation for requests for alternatives, without adding
a refactor to an ordinary review.

The AGENTS.md and .github/copilot-instructions.md entry points and the UI/API
agents link to shared workflows. Agents and prompts in .github are not copies
of skill packages and remain in their client-specific locations.

[VS Code supports this skills directory](https://code.visualstudio.com/docs/agent-customization/agent-skills).
No second skill copies or symlinks are maintained.
Check package discovery in your client's skill catalog; valid file structure
does not replace that check.

[Back to setup](../README.md)
