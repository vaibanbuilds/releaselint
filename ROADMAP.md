# Roadmap

ReleaseLint is a release readiness linter for GitHub projects. The goal is to help maintainers make release gates repeatable, auditable, and CI-friendly.

## Completed in v0.1

- Added config validation and config scaffolding commands.
- Added conventional commit checks for release-range commit messages.
- Added a clean passing fixture for documentation and tests.
- Improved linked issue detection across issue bodies and merged PR bodies.
- Added GitHub Actions annotations for blockers and warnings.
- Added version checks for `pyproject.toml` and `Cargo.toml`.
- Fixed local GitHub Action wrapper execution on Windows.
- Added opt-in sticky Markdown reports on release pull requests.
- Added trusted npm publishing from version tags.

## Next

- Improve release evidence around commit messages and release notes.
- Support additional ecosystem version files beyond `package.json`, `pyproject.toml`, and `Cargo.toml`.
- Make release reporting clearer for larger release ranges.

## Later

- Add monorepo package selection.
- Support custom severity levels per rule.
- Add optional AI-assisted drafting for migration notes and release notes, while keeping rule decisions deterministic.
