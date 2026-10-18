# Coding debt notes

Context for deferred work and historical proposals. The single active backlog
is in [NOTES.md](NOTES.md#current-learning-queue-october-18-2026). Historical proposals below are
not new implementation instructions. This document is not embedded in the report.

The learner chose to keep the Marketplace purchase cleanup unchanged. See the
[agreed cleanup scope](NOTES.md#agreed-decision-keep-marketplace-purchase-cleanup).
Earlier cleanup refactoring and fault-injection proposals below are superseded;
do not add them back to the active learning queue.

### Historical refactoring proposals: October 10, 2026

Steps 5 and 6 below are implemented in commit `8596fda`; step 7 is implemented
in the current working tree. These paragraphs preserve the original proposals,
not current implementation instructions. The active next steps are in
[NOTES](NOTES.md#current-learning-queue-october-18-2026).

5. **Make the HTTP envelope explicit in two small changes ? Stage 1b.**
   First use the existing `ApiEnvelope<T>` for the parsed response in
   `src/api/httpClient.ts`, replacing its inline type. Preserve current request,
   JSON parsing, status handling, and return behavior. This is a type-only
   refactor: it does not validate runtime JSON. Then separately decide and
   implement rejection when `success !== true`; currently only explicit
   `false` is rejected, so a missing success field is accepted. That second
   change tightens the reader contract and must not be presented as behavior
   preservation. Exercise the existing client with stubbed responses for a
   valid envelope, explicit failure, missing success, malformed JSON, and HTTP
   failure. Preserve support for successful delete responses without data.
   Do not add a schema library, 204 support, new HTTP verbs, or change raw
   negative-request helpers. Run focused client checks, dependent API tests,
   and `check:ci` for this shared change.

6. **Separate API session setup from browser setup ? Stage 1.**
   `freshUser` currently depends on a browser context and copies cookies even
   for API-only consumers. Separately, `TC-FIN-011` logs in that user again to
   obtain its session ID. Compare keeping the fixture, adding a proposed
   `apiSession` fixture returning the user plus session, and making `freshUser`
   a UI adapter over that session. Prefer the last option only when selected
   for implementation: migrate `TC-FIN-011` first to consume the session
   without another login. Preserve cookie setup for UI consumers, distinct
   accounts, and raw authentication scenarios. Do not migrate all tests at once.
   Verify the focused account case, then API and isolated UI consumers because
   authentication fixture changes cross both layers. No speed gain is claimed
   without measurement.

7. **Select the resource explicitly in UI offer creation ? Stage 1b.**
   `MarketplacePage.createNewOffer` randomly chooses an item although
   `TC-MARKET-003` already has `createdAnimal.id`. Compare keeping the existing
   method, adding an optional item-ID branch, and requiring an explicit item ID.
   Prefer the explicit input when undertaking this exercise; adapt both actual
   callers (the Marketplace spec and the farm-setup journey through
   `createMarketplaceOffer`). Inspect how the journey obtains seller resource
   IDs before implementation. Keep waiting for the requested option to load;
   do not simply remove the current readiness assertion. Select the option by
   ID and preserve UI success checks in specs. Resource/offer cleanup is a
   separate lifecycle concern, not implicitly solved by selection. Run both
   affected scenarios and their projects. Do not combine this with rebuilding
   purchase tests or shared Marketplace test data.

### Intentionally deferred

Additional Marketplace purchase contracts are deferred beyond the selected UI exercise. Before reusing
`activeFieldOffer`, inspect cleanup after ownership transfer: its field currently
belongs to the seller's `createdField` fixture. This fixture was selected for
cancellation and rejection scenarios; successful-purchase cleanup has not been
verified. Do not expand it speculatively now.

On October 6, the learner deferred coverage-run diagnosis. Reporting is not a
prerequisite for these exercises. When useful again, record an API baseline with
`npm run coverage:run -- --project=api-tests --workers=1 --retries=0`.
Archive results before comparing runs because each run replaces the current one.
Visual baselines, session/project organization, smoke baseline, and broader HTTP
client changes remain in their existing stages.
