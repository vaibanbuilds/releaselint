# Codex Handoff for ReleaseLint

Use this file when continuing the project from a new computer or a Codex instance without prior memory.

## Project

- Repository: `https://github.com/vaibanbuilds/releaselint`
- npm package: `@vaibanbuilds/releaselint`
- Maintainer: `vaibanbuilds`
- Purpose: a deterministic release-readiness linter for GitHub projects.
- Product surface: Node.js CLI + GitHub Action.
- Positioning: not an AI assistant, not an OpenAI API wrapper, not a release-note generator.

## Current Status as of 2026-06-04

- GitHub release: `v0.1.2`
- npm latest: `0.1.2`
- Main branch latest known commit: `97fbc38 feat: support Python and Rust version files`
- CI for `97fbc38` passed.
- OpenAI Codex for Open Source application was submitted around 2026-06-01; no official reply yet as of 2026-06-04.
- GitHub 2FA is enabled.
- Temporary npm publish token was deleted after use.

## What Is on Main but Not Yet Released

The `v0.1.3` candidate work is already on `main`:

- `pyproject.toml` version parsing from `[project].version`
- `Cargo.toml` version parsing from `[package].version`
- `version-file` input for the GitHub Action
- fixtures and CI scripts for Python/Rust version-file checks
- Windows local Action wrapper path fix

Do not rush a release. A natural rhythm is to release `v0.1.3` after a short delay if CI remains green.

## Open Issues

- #5 `feat: support more version file formats`
  - Implemented on main.
  - Keep open until `v0.1.3` release, then close it.
- #2 `feat: post Markdown report to release pull requests`
  - Still open.
  - Bigger feature, suitable after `v0.1.3`.

## Standard Checks

Run before committing/releasing:

```powershell
npm run check
npm run check:json
npm run check:passing
npm run check:pyproject
npm run check:cargo
npm run check:annotations
npm pack --dry-run
```

Check published state:

```powershell
npm view @vaibanbuilds/releaselint version dist-tags --json
git status -sb
```

## Release Advice

For `v0.1.3`, when ready:

1. Bump `package.json` to `0.1.3`.
2. Move `CHANGELOG.md` Unreleased entries to `## v0.1.3 - <date>`.
3. Update README Action references from `v0.1.2` to `v0.1.3`.
4. Run all checks.
5. Commit release files.
6. Tag and create GitHub release.
7. Publish npm.
8. Verify npm latest.
9. Close issue #5.

## Safety Rules

- Never ask the maintainer to paste tokens, OTP codes, recovery codes, or API keys into chat.
- If npm publish needs a token, use a short-lived granular token with package read/write and bypass 2FA, then delete it after publishing.
- Do not fake stars, downloads, issues, or users.
- Do not resubmit the OpenAI application unless OpenAI rejects it or asks for more information.

## How to Install the Skill on Another Computer

For a full Chinese deployment walkthrough, see:

```text
CODEX_TRANSFER_DEPLOYMENT.zh-CN.md
```

This repository includes a portable skill at:

```text
codex-skills/releaselint-maintainer
```

Copy that folder into the new computer's Codex skills directory, usually:

```text
C:\Users\<you>\.codex\skills\releaselint-maintainer
```

Then ask Codex to use the `releaselint-maintainer` skill, or simply ask it to read this `CODEx_HANDOFF.md` file first.
