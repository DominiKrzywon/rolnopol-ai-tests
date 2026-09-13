# Improvement register for the conversation or existing plan

For each significant item, record:

| Field        | Content                                                  |
| ------------ | -------------------------------------------------------- |
| Observation  | File and line plus behavior visible in code or execution |
| Cost         | What makes diagnosis harder or reduces test confidence   |
| Priority     | Now, next, or intentionally deferred                     |
| Correction   | The smallest change and its risks                        |
| Learning     | The concept explained by the exercise                    |
| Verification | A specific test or check and the expected evidence       |
| Roadmap      | An existing TEST_PLAN.md item or a proposed addition     |

Describe size qualitatively and explain it: a local assertion change, a fixture
change affecting several callers, or configuration affecting multiple projects.
Do not combine subjective ratings into a seemingly precise numerical score.

Example to inspect in the current repository:
[data cleanup](../../../../src/fixtures/data.fixture.ts) may suppress deletion
failures. The exercise is to distinguish an accepted missing resource from a
real cleanup failure. Do not assume the problem exists without reading the file;
once the example is fixed, do not add it to the backlog again.
