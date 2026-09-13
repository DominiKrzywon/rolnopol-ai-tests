# Traces for diagnosis

After opening your session, start tracing before the action under investigation.
Check command support in the local CLI.

```powershell
playwright-cli -s=rolnopol-exercise tracing-start
playwright-cli -s=rolnopol-exercise snapshot
playwright-cli -s=rolnopol-exercise tracing-stop
```

Perform reproduction steps between start and stop. Read the artifact location
from the actual CLI output; do not assume its filename or format.
For framework tests, read the current trace option in playwright.config.ts.

Investigate the order of responses, navigation, and assertions. Recording a trace
does not automatically establish the cause. Requests in the artifact may contain
secrets; do not publish it or paste raw session data into the report.
