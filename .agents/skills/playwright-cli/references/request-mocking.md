# Mocking for UI tests

A mock is useful for a specific UI state: an empty list, an error, or controlled
data. Do not present a mocked test as evidence that the backend works.

Before registering a route, establish the actual URL from current code or a request.
Check support for `route`, `route-list`, and `unroute` in the local CLI.
Limit interception to the required endpoint and task session.

Preserve the important shape of the real contract in mocked responses.
Do not return success for every request by default, as that hides UI defects.
Remove your own rules after reproduction or close your session.

Verify the backend contract in a separate API test without mocking.
Document an observed case as an observation until the expected behavior is established.
