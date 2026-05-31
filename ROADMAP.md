# Roadmap

ReleaseLint is a release readiness linter for GitHub projects. The goal is to help maintainers make release gates repeatable, auditable, and CI-friendly.

## v0.2

- Add GitHub Action annotations for blockers and warnings.
- Support posting Markdown reports to release pull requests.
- Improve linked issue detection across PR bodies and commit messages.

## v0.3

- Support more version files beyond `package.json`.
- Add conventional commit checks.
- Add a clean passing fixture for documentation and tests.

## v0.4

- Add monorepo package selection.
- Support custom severity levels per rule.
- Add optional AI-assisted drafting for migration notes and release notes, while keeping rule decisions deterministic.
