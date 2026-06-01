# GitHub Action Example

This example shows how to run ReleaseLint before publishing a release.

Copy `release-readiness.yml` into your repository:

```text
.github/workflows/release-readiness.yml
```

Then run it manually from the GitHub Actions tab and provide the previous release tag, for example:

```text
v1.2.0
```

ReleaseLint will inspect merged pull requests, closed issues, release labels, and the configured version file. If blockers are found, the workflow fails before a release is published.

## Required Permissions

```yaml
permissions:
  contents: read
  pull-requests: read
  issues: read
```

## Configuration

Add a `.releaselint.json` file to customize label mapping and release-readiness requirements.
