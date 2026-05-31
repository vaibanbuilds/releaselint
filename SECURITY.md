# Security Policy

ReleaseLint reads GitHub repository metadata and may run in CI with a GitHub token.

## Supported Versions

Security fixes are currently applied to the latest released version.

## Reporting a Vulnerability

Please report security issues privately by opening a minimal GitHub issue that says a security report is available, without including sensitive details. The maintainer will coordinate a private follow-up channel.

Do not include access tokens, private repository data, or exploit details in public issues.

## Token Handling

ReleaseLint does not store GitHub tokens. Tokens are read from the `--token` option or `GITHUB_TOKEN` environment variable and used only for GitHub API requests during the current run.
