# Short observations with run-code

Check command support in the installed CLI version. In PowerShell, use single
quotes around JavaScript so the shell does not interpolate the code.

```powershell
playwright-cli -s=rolnopol-exercise run-code 'async page => ({ title: await page.title(), url: page.url() })'
```

Read only the state needed for reproduction. Do not return cookies, tokens,
saved sessions, or complete login request bodies to the terminal.
Do not read environment files from browser code.

An exploration script does not replace a spec. When moving it into the framework,
place the locator and action in the existing Page Object and the behavioral
assertion in the test.
