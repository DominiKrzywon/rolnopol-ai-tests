# Rolnopol dependency review checklist

Load for reviews spanning multiple files. Select questions relevant to the change.

## Does the test prove the behavior?

- Does the assertion read state after the action? For a rejected financial operation,
  a message alone does not confirm that the balance remained unchanged.
- Does response waiting start before form submission?
- Did the negative case reach the intended validation, rather than being blocked
  by a different form field?
- Do the status, test name, and assertion message describe the same contract?
- Is a parameter represented as a separate reported case when diagnosis depends on it?

## Isolation and lifecycle

- Trace `test.fixture → auth.fixture → data.fixture` and the actual import used.
- Check scope, setup/teardown order, and behavior after partial setup failure.
- Does cleanup affect only owned resources? Is failure visible or covered
  by an explained, specific exception?
- Can logging into a shared account invalidate another test's session?
- Copying cookies from request to browser does not imply automatic synchronization
  of later session changes in both directions.
- Does the new filename match the intended project without triggering demo setup?

## Layers and contracts

- Page Objects expose actions and locators; behavioral assertions belong in specs.
- Distinguish setup success checks from scenario assertions.
- Raw `APIResponse` is needed when the test asserts a 4xx response;
  a helper that throws earlier may prevent that assertion.
- A TypeScript type does not validate a response at runtime.
- Do not design another client layer or support extra statuses without a concrete use.

## Stability and diagnostics

- Do CDN dependencies, dynamic text, or the platform affect the snapshot?
- Has the baseline diff been inspected? Overwriting an image alone does not fix a test.
- Do worker count and login volume affect the rate limiter? Require measurements.
- Do traces, reports, and error messages expose the cause without exposing sessions?
- Are CI scope and project dependencies consistent with the change?

Do not label a test flaky solely because of a code pattern.
Do not mark a plan item complete solely because a matching filename exists.
