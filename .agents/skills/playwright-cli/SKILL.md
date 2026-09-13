---
name: playwright-cli
description: 'Explore Rolnopol UI and reproduce browser behavior with an available Playwright CLI: inspect snapshots, interact with a task session, and capture focused evidence. Use for browser exploration, not as a substitute for running Playwright Test or maintaining its specs.'
---

# Exploring Rolnopol with CLI

Apply the [shared context](../CONTEXT.md).
CLI is optional. First check whether `playwright-cli` is available and inspect
its `--help`. Do not install tools or change MCP configuration merely because
this skill was opened. Use an available browser tool if it fits the task.
Command examples require compatibility with the installed version.

## Workflow

1. Establish the flow and environment URL. `http://localhost:3000` below
   is an example, not an instruction to override BASE_URL.
2. Create a task session. Use your own test account when writes are needed.
   Do not connect a shared demo session for data changes.
3. Read the snapshot; use current element references rather than previously
   recorded `e1` or `e2`. Inspect again after navigation.
4. Perform minimal reproduction steps. Separate observation from test requirements.
5. Store required evidence in the ignored `.playwright-cli/` directory.
   Report results without tokens, cookies, or credentials.
6. Close your own session. Do not use `close-all` or `kill-all` as routine
   cleanup because they may affect sessions outside the task.
7. When turning observations into a test, use
   [playwright-test-automation](../playwright-test-automation/SKILL.md).
   Successful exploration does not mean a spec passed.

## Minimal example

```powershell
playwright-cli --help
playwright-cli -s=rolnopol-exercise open http://localhost:3000
playwright-cli -s=rolnopol-exercise snapshot
playwright-cli -s=rolnopol-exercise close
```

## Resources on demand

- [Sessions](references/session-management.md): exploration isolation.
- [Running code](references/running-code.md): short DOM observations.
- [Storage state](references/storage-state.md): cookies and session transfer.
- [Mocking](references/request-mocking.md): controlled UI responses.
- [Test creation](references/test-generation.md): from observation to spec.
- [Trace](references/tracing.md): diagnosing event sequences.
- [Video](references/video-recording.md): recording the visible flow.

## Done

The result identifies the observation, environment, and reproduction scope;
your session is closed, and exploration is not presented as a test-run result.
