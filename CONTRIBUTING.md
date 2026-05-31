# Contributing

Thanks for helping improve ReleaseLint.

ReleaseLint is intentionally small: it should behave like a deterministic release gate, not a general-purpose release assistant. Contributions are most useful when they improve checks, evidence, configuration, or CI behavior.

## Development

```bash
npm install
npm run check
npm run check:json
```

The sample fixture in `fixtures/sample-release.json` intentionally contains release-readiness problems so reports can show blockers and warnings. `fixtures/passing-release.json` and `fixtures/package-v1.2.1.json` show a clean release-readiness report.

## Pull Requests

Before opening a pull request:

- Keep changes focused.
- Add or update a fixture when changing rule behavior.
- Update the README when adding a user-facing option.
- Explain which release-readiness rule changed and why.

## Useful Contribution Areas

- More version file formats
- Better linked issue detection
- GitHub Action annotations
- Release PR comments
- Conventional commit checks
- Monorepo package selection
