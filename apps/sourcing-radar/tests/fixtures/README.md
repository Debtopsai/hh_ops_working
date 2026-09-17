# Fixtures

Everything in here is **synthetic**. No live response from any auction house has
been captured yet, because the build environment's egress policy blocks all four
source hosts (see `docs/DISCOVERY.md`).

These fixtures exercise the mapping engine, the runner and the alert pipeline
against a payload shape of our own invention. They prove the machinery works.
They do not prove that any real source looks like this, and they must not be
read as a record of one.

When discovery happens, save the real responses next to these as
`<slug>-live.json` and `turners-live.html`, and point the config tests at those.
