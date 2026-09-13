# Authentication state during exploration

Check `state-save` and `state-load` syntax in the local CLI.
Save state only when reproduction requires session reuse.

```powershell
playwright-cli -s=rolnopol-exercise state-save .playwright-cli/exercise-auth.json
playwright-cli -s=rolnopol-exercise state-load .playwright-cli/exercise-auth.json
```

The file may contain credentials. Do not read it into the conversation, commit it,
or copy it into tracked materials. After loading it, inspect the actual page state;
the file does not guarantee that the session is still valid on the server.

Distinguish request and browser state. In this repository,
[applySessionCookies](../../../../src/api/auth.api.ts) copies cookies
from request to the browser context. A later UI logout does not automatically
prove that the session was removed from a separate request context.
