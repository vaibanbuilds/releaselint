# Contributing

Thanks for helping improve ReleaseLint.

ReleaseLint is intentionally small: it should behave like a deterministic release gate, not a general-purpose release assistant. Contributions are most useful when they improve checks, evidence, configuration, or CI behavior.

## Development

```bash
npm install
npm run check
npm run check:json
npm run check:passing
npm run check:pyproject
npm run check:cargo
npm run check:commits
npm run check:init
npm run check:config
```

The sample fixture in `fixtures/sample-release.json` intentionally contains release-readiness problems so reports can show blockers and warnings. `fixtures/passing-release.json` and `fixtures/package-v1.2.1.json` show a clean release-readiness report.

If you change rule behavior, update or add a fixture so the expected result stays explicit.

## Pull Requests

Before opening a pull request:

- Keep changes focused.
- Add or update a fixture when changing rule behavior.
- Update the README or README.zh-CN when adding a user-facing option or workflow step.
- Mention whether the change affects release labels, version checks, linked issues, or publishing.
- Prefer small PRs that touch one rule, one command, or one workflow at a time.

## Release Workflow

ReleaseLint uses `main` for normal development, `v*.*.*` tags for npm publishing, and GitHub Releases for the published changelog entry.

When preparing a release-related change:

- Keep `package.json`, the changelog, README examples, and workflow references in sync.
- Run the full fixture suite before merging.
- Verify the release workflow still passes on GitHub Actions.

## Useful Contribution Areas

- More version file formats
- Better linked issue detection
- GitHub Action annotations
- Release PR comments
- Conventional commit checks
- Monorepo package selection
- Release notes and workflow polish
