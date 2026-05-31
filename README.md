# ReleaseLint

ReleaseLint is a release readiness linter for GitHub projects. It checks whether a release has enough evidence to ship before a maintainer cuts a tag.

It is not a release-note generator, an AI assistant, or an automatic publishing tool. ReleaseLint focuses on deterministic checks that can run in CI.

## Why

Maintainers often need to answer the same questions before every release:

- Do merged pull requests have release labels?
- Do breaking changes include migration notes?
- Does the version bump match the merged work?
- Were issues closed with a traceable PR or commit?
- Can the release report explain why it passed or failed?

ReleaseLint turns those questions into a repeatable gate.

## Install

```bash
npm install -g releaselint
```

For local development from this repository:

```bash
npm install
npm run check
```

## CLI

```bash
releaselint check --repo owner/name --since-tag v1.2.0
```

Useful options:

```bash
releaselint check --repo owner/name --since-tag v1.2.0 --format json
releaselint check --fixture fixtures/sample-release.json
releaselint check --repo owner/name --since-tag v1.2.0 --no-fail
```

Set `GITHUB_TOKEN` to avoid GitHub API rate limits:

```bash
GITHUB_TOKEN=ghp_xxx releaselint check --repo owner/name --since-tag v1.2.0
```

## GitHub Action

```yaml
name: Release readiness

on:
  workflow_dispatch:
    inputs:
      since-tag:
        description: Base tag to check from
        required: true

jobs:
  releaselint:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
      issues: read
    steps:
      - uses: actions/checkout@v4
      - uses: vaibanbuilds/releaselint@v0
        with:
          since-tag: ${{ inputs.since-tag }}
```

## Configuration

Create `.releaselint.json`:

```json
{
  "labels": {
    "major": ["breaking-change", "breaking"],
    "minor": ["feature", "feat", "enhancement"],
    "patch": ["bug", "bugfix", "fix"],
    "none": ["docs", "documentation", "chore", "internal", "test"]
  },
  "requirements": {
    "requireReleaseLabel": true,
    "requireMigrationNotesForBreaking": true,
    "requireLinkedIssueForClosedIssues": true
  },
  "migrationNoteMarkers": ["migration", "breaking change", "upgrade notes"],
  "issueLinkPatterns": ["fixes #", "closes #", "resolves #"]
}
```

## Checks

ReleaseLint v0.1 checks:

- Merged PRs must have a release label.
- Breaking PRs must include migration notes.
- Release labels produce a `major`, `minor`, `patch`, or `none` bump recommendation.
- Local `package.json` version should match the recommended bump when available.
- Closed issues should link to a PR or commit unless they are marked `no-code-change`, `invalid`, `duplicate`, or `wontfix`.

## Design Principles

- Deterministic first: AI can help write notes later, but rules decide readiness.
- Evidence over prose: findings point back to PRs, issues, or commits.
- CI-friendly: non-zero exit codes can block a release workflow.
- Maintainer-owned: users run it with their own repository permissions and tokens.

## Roadmap

- Markdown comments on release PRs
- More version file formats
- Monorepo package selection
- Conventional commit checks
- Optional AI-assisted migration-note and release-note drafting

## License

MIT
