# Testing

## The loop

Every behaviour change ships with a test. For a bug fix, write the failing test
first — a fix without a reproducing test is a guess.

1. Write the test. Run it. **Watch it fail** for the reason you expect.
2. Make it pass with the smallest change that works.
3. Run the full suite before declaring done.

A test that has never failed has proven nothing.

## What to test

Test behaviour through the public interface, not internals. If a test breaks
when you rename a private function, it was testing the wrong thing.

Cover: the happy path, the boundaries (empty, one, many, max), and the error
paths. Skip: getters, framework code, anything with no branching.

## Mocks

Mock only what you do not own — network, clock, filesystem, third-party SDKs.
Never mock the code under test. A suite that passes entirely on mocks tells you
your mocks agree with each other.

## Fixtures

Fixture files are a contract. When one changes, diff it deliberately and say
what changed and why — a fixture updated to match new output is either a fix or
a regression, and only the diff tells you which.

## Reporting

Never report a passing suite you have not run. If tests fail, say so and paste
the output. If a test was skipped, say that too.
