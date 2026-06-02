# Changelog

## Unreleased

- Added GitHub Actions annotations for blockers and warnings.
- Added `--annotations auto|always|never` for annotation control.

## v0.1.1 - 2026-05-31

- Improved linked issue detection by reading merged pull request bodies.
- Added fixture coverage for PR-body issue links.
- Documented linked issue marker behavior in English and Chinese READMEs.
- Added visual README demos, CI fixture checks, and a copy-paste GitHub Action example.
- Published package under the scoped npm name `@vaibanbuilds/releaselint`.

## v0.1.0 - 2026-05-31

Initial MVP release of ReleaseLint.

- Added a zero-dependency Node.js CLI.
- Added GitHub Action support.
- Added configurable release label rules.
- Added checks for missing release labels, missing migration notes on breaking changes, linked closed issues, and version bump evidence.
- Added Markdown and JSON report output.
