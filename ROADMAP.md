# Roadmap

ReleaseLint is a release readiness linter for GitHub projects. The goal is to help maintainers make release gates repeatable, auditable, and CI-friendly.

## Completed in v0.1

- Added a clean passing fixture for documentation and tests.
- Improved linked issue detection across issue bodies and merged PR bodies.
- Added GitHub Actions annotations for blockers and warnings.

## Next

- Support more version files beyond `package.json`.
- Support posting Markdown reports to release pull requests.
- Improve linked issue detection across commit messages.

## Later

- Add conventional commit checks.
- Add monorepo package selection.
- Support custom severity levels per rule.
- Add optional AI-assisted drafting for migration notes and release notes, while keeping rule decisions deterministic.
