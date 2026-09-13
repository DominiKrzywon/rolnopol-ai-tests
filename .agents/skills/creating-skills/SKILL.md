---
name: creating-skills
description: 'Create or update reusable skills for the Rolnopol learning repository. Use to package a repeated workflow, repair skill structure, reduce duplicated instructions, or align skill routing and resources with the local test framework.'
---

# Maintaining Rolnopol skills

Apply the [shared context](../CONTEXT.md).

## Workflow

1. Define the skill's concrete task and a realistic user request.
   Check existing skills before adding another one.
2. Keep every package in `.agents/skills/`. Match the directory to
   the `name` field: lowercase letters, digits, and single hyphens, at most 64 characters.
3. Write `name` and a nonempty `description` in YAML. The description should
   explain when to select the skill and how it differs from its nearest neighbor.
   Preserve automatic selection unless the user explicitly requests otherwise.
4. Describe the workflow and completion criteria in the body. Link to the shared
   context and repository sources instead of copying learning rules, commands, and the roadmap.
5. Add resources only when they clarify a significant decision:
   the [template](references/skill-template.md), the existing
   [code-review](../code-review/SKILL.md) example, and the
   [checklist](references/skill-quality-checklist.md) help prepare a package.
   A simple skill may contain only SKILL.md.
6. Use relative Markdown links. Do not require missing files or skills.
   A thematic relationship does not necessarily require a handoff.
7. When moving packages, check references in README, instructions, agents, and prompts.
   Do not create copies or symlinks in a second skills directory.
8. Validate the structure and walk through a realistic checklist task.
   File validation does not prove automatic skill activation in every client.

## Done

Names and metadata are consistent, links resolve, unnecessary duplication is absent,
and the workflow helps complete a concrete repository task without adding unrelated scope.
