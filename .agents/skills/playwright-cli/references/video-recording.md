# Recording a UI flow

Video helps show a sequence of screens; it does not confirm the API contract.
Check recording support in the local CLI and open your own session before starting.

```powershell
playwright-cli -s=rolnopol-exercise video-start
playwright-cli -s=rolnopol-exercise snapshot
playwright-cli -s=rolnopol-exercise video-stop .playwright-cli/exercise.webm
```

Reproduce the flow with test data between start and stop.
Confirm file creation from the tool result. For request and navigation diagnosis,
use a [trace](tracing.md). A recording does not replace test assertions.
