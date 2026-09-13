# A session for the exercise

Check `playwright-cli --help` before using these examples. Send each command
to the same named session; adjust the URL to the environment under investigation.

```powershell
playwright-cli -s=rolnopol-exercise open http://localhost:3000
playwright-cli -s=rolnopol-exercise snapshot
playwright-cli -s=rolnopol-exercise close
```

Separate browser contexts do not isolate a shared server-side account.
For two users, prepare two owned accounts rather than just two CLI sessions.
Logging in again can affect an existing session for the same account.

Close your session after failures as well. Do not close all browsers globally.
Use a persistent profile only when the task requires it; do not select the
user's private profile for an ordinary exercise.
