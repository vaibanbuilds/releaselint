# ReleaseLint Project Context

Last updated: 2026-06-04.

## Repository

- GitHub: `https://github.com/vaibanbuilds/releaselint`
- npm: `@vaibanbuilds/releaselint`
- Local path on original machine: `C:\Users\jq\Documents\Codex\2026-05-31\https-x-com-ayi-ainotes-status\outputs\releaselint`
- Maintainer: `vaibanbuilds`
- License: MIT
- Project purpose: deterministic release-readiness linting for GitHub projects before maintainers cut a tag.
- Positioning: CLI + GitHub Action, not an OpenAI wrapper, not an AI assistant, not a release-note generator.

## Application Context

The maintainer applied for OpenAI Codex for Open Source around 2026-06-01. As of 2026-06-04 there was no official reply yet. This is not necessarily bad; do not encourage repeated submission. Continue real maintenance and wait for the official email.

Desired posture: build a real useful open-source maintenance tool, not a project that looks created only for benefits.

## Current Released State

- GitHub release `v0.1.2` exists.
- npm latest is `0.1.2`.
- CI is green through commit `97fbc38`.
- `v0.1.2` added GitHub Actions annotations.
- `v0.1.1` improved linked issue detection and moved npm package to the scoped name.
- `v0.1.0` was the MVP.

## Current Main State

Commit `97fbc38 feat: support Python and Rust version files` is on `main` and has passed CI.

Unreleased changes on `main`:

- Support `pyproject.toml` version parsing from `[project].version`.
- Support `Cargo.toml` version parsing from `[package].version`.
- Add `fixtures/pyproject.toml` and `fixtures/Cargo.toml`.
- Add `check:pyproject` and `check:cargo`.
- Add `version-file` input to the GitHub Action.
- Fix local GitHub Action wrapper execution on Windows by using `fileURLToPath`.

Do not publish immediately unless the maintainer asks. Better rhythm: release `v0.1.3` after a short delay if CI remains green.

## Open Issues

- #5 `feat: support more version file formats`
  - Implemented on `main` in `97fbc38`.
  - Leave open until `v0.1.3` release, then close cleanly.
- #2 `feat: post Markdown report to release pull requests`
  - Still open.
  - Good next feature after `v0.1.3`, but larger scope than #5.

## Verification Commands

Run these before release or after significant changes:

```powershell
npm run check
npm run check:json
npm run check:passing
npm run check:pyproject
npm run check:cargo
npm run check:annotations
npm pack --dry-run
```

Check external state:

```powershell
git status -sb
npm view @vaibanbuilds/releaselint version dist-tags --json
```

## Release Guidance

For `v0.1.3`:

1. Bump `package.json` from `0.1.2` to `0.1.3`.
2. Move `CHANGELOG.md` Unreleased entries to `## v0.1.3 - <date>`.
3. Update README Action examples from `v0.1.2` to `v0.1.3`.
4. Run all checks and `npm pack --dry-run`.
5. Commit release files.
6. Create tag and GitHub release.
7. Publish npm with `npm publish --access public`.
8. Verify `npm view @vaibanbuilds/releaselint version`.
9. Close issue #5 with a release note.

Avoid publishing `v0.1.3` too soon after the feature commit unless there is a strong reason.

## Security and Account Notes

- GitHub 2FA is enabled.
- npm publish may require OTP or a short-lived granular token with bypass 2FA.
- The maintainer once exposed an npm token in a screenshot and revoked it. Never ask them to paste secrets in chat.
- If a temporary npm token is used, remind the maintainer to delete it after publishing.

## Communication Notes

The maintainer is anxious about whether the project is "good enough" and whether lack of stars means failure. Be honest and steady:

- Low stars early are normal.
- Do not promise OpenAI approval.
- Emphasize concrete quality signals: releases, CI, npm package, 2FA, roadmap, issues, changelog, and real maintenance.
- Recommend natural maintenance cadence over rushed commits.
