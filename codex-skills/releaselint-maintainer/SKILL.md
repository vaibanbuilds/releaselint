---
name: releaselint-maintainer
description: Maintain the vaibanbuilds/releaselint open-source project with its project history, release rhythm, OpenAI Codex for Open Source application context, npm/GitHub publishing cautions, and next-step roadmap. Use when working on ReleaseLint, preparing releases, checking project status, continuing maintenance from another computer, or advising the maintainer about OpenAI application timing.
---

# ReleaseLint Maintainer

## First Step

Read `references/project-context.md` before making decisions. It contains the current repository state, release history, open issues, and safety constraints.

If the repository contains `CODEX_HANDOFF.md`, read it too. Treat the handoff file as the portable source of truth for another computer.

## Operating Style

- Reply to the maintainer in Chinese unless they ask otherwise.
- Keep maintenance natural and conservative. Prefer one useful change plus tests over many rushed commits.
- Do not fabricate adoption signals. Never suggest fake stars, fake downloads, fake issues, or fake users.
- Do not resubmit the OpenAI application unless the maintainer receives a rejection or official request for more information.
- Do not ask the maintainer to paste npm tokens, GitHub tokens, OTP codes, recovery codes, or API keys.
- If publishing to npm, remind the maintainer to revoke temporary publish tokens after use.

## Default Workflow

1. Check local and remote state:
   - `git status -sb`
   - `git log --oneline --decorate -10`
   - `npm view @vaibanbuilds/releaselint version dist-tags --json`
2. Inspect open GitHub issues before choosing work.
3. Prefer the next useful small task from the roadmap.
4. Run the relevant checks before committing:
   - `npm run check`
   - `npm run check:json`
   - `npm run check:passing`
   - `npm run check:pyproject`
   - `npm run check:cargo`
   - `npm run check:annotations`
   - `npm pack --dry-run`
5. Push commits normally with git when possible.
6. For releases, create GitHub release and npm release only when the rhythm makes sense.

## Release Rhythm

- Avoid releasing several versions on the same day unless a real fix requires it.
- Current best rhythm after `v0.1.2`: keep the Python/Rust version-file work on `main`, then release `v0.1.3` after a short delay if CI stays green.
- Use `CHANGELOG.md` Unreleased entries as the release source.
- Close issue #5 only when the `v0.1.3` release is published.

## Safety Notes

- The maintainer previously exposed an npm token in a screenshot and revoked it. Continue to be careful with secrets.
- GitHub 2FA is enabled.
- npm 2FA/token publishing has been tricky. If npm blocks publish with OTP, prefer a short-lived granular token with package read/write and bypass 2FA, then revoke it.
- Do not run destructive git commands unless the maintainer explicitly asks. If local git diverges because GitHub API was used, back up before aligning.
