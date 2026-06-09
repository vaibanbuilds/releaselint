# ReleaseLint

[![npm version](https://img.shields.io/npm/v/@vaibanbuilds/releaselint.svg)](https://www.npmjs.com/package/@vaibanbuilds/releaselint)
[![CI](https://github.com/vaibanbuilds/releaselint/actions/workflows/ci.yml/badge.svg)](https://github.com/vaibanbuilds/releaselint/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](README.md)

ReleaseLint 是一个面向 GitHub 项目的发布就绪检查工具。它会在维护者发布新版本之前，检查这次发布是否具备足够的证据和规则约束。

它不是 release notes 生成器，也不是 AI 助手，更不是自动发版工具。ReleaseLint 专注于可重复、可审计、能在 CI 中运行的确定性检查。

## 快速演示

ReleaseLint 会把 GitHub 发版证据整理成适合 CI 使用的发布就绪报告：

```mermaid
flowchart LR
  A["已合并 PR"] --> D["ReleaseLint"]
  B["已关闭 issue"] --> D
  C["版本文件"] --> D
  E[".releaselint.json"] --> D
  D --> F["Blocker / warning"]
  D --> G["Semver 版本建议"]
  D --> H["Markdown 或 JSON 报告"]
```

### 可以发布的版本

![ReleaseLint 通过报告](assets/demo-ready.svg)

运行通过示例：

```bash
npm run check:passing
```

### 存在发布风险的版本

![ReleaseLint 风险报告](assets/demo-blockers.svg)

运行一个包含发布风险的示例：

```bash
npm run check
```

ReleaseLint 会报告缺少 release label、breaking change 缺少迁移说明等 blocker。

### 典型使用流程

1. 在仓库中添加 `.releaselint.json`。
2. 给 PR 使用 `feature`、`fix`、`docs`、`breaking-change` 等 release label。
3. 在本地或 GitHub Actions 中运行 ReleaseLint。
4. 修复 blocker 后再发布 tag。

## 为什么需要它

开源维护者在每次发版前，经常需要回答这些问题：

- 已合并的 PR 是否都有 release label？
- 破坏性变更是否写了迁移说明？
- 当前版本号变更是否和已合并内容匹配？
- 已关闭的 issue 是否能追溯到 PR 或 commit？
- 发布报告能否解释为什么通过或失败？

ReleaseLint 把这些问题变成可以自动运行的发布门禁。

## 安装

```bash
npm install -g @vaibanbuilds/releaselint
```

如果你是从仓库本地开发：

```bash
npm install
npm run check
```

生成初始配置：

```bash
releaselint init
releaselint init --print
```

## 发布到 npm

仓库包含一个 `Publish` workflow，用于发布 npm 版本。推送 `v*.*.*` tag 时它会运行，并在发布前确认 tag 与 `package.json` 版本一致。

如果使用 npm trusted publishing，请在 npmjs.com 的包设置中配置：

- Organization or user：`vaibanbuilds`
- Repository：`releaselint`
- Workflow filename：`publish.yml`
- Allowed action：`npm publish`

配置完成后，维护者可以这样发布版本：

```bash
git tag v0.1.3
git push origin v0.1.3
```

## CLI 用法

```bash
releaselint check --repo owner/name --since-tag v1.2.0
```

常用选项：

```bash
releaselint check --repo owner/name --since-tag v1.2.0 --format json
releaselint check --fixture fixtures/sample-release.json
releaselint check --fixture fixtures/passing-release.json --version-file fixtures/package-v1.2.1.json
releaselint check --fixture fixtures/passing-release.json --version-file fixtures/pyproject.toml
releaselint check --fixture fixtures/passing-release.json --version-file fixtures/Cargo.toml
releaselint check --fixture fixtures/sample-release.json --annotations always
releaselint check --repo owner/name --since-tag v1.2.0 --no-fail
```

仓库里包含两个 fixture：

- `fixtures/sample-release.json` 展示带有 blocker 和 warning 的发布。
- `fixtures/passing-release.json` 和 `fixtures/package-v1.2.1.json` 展示可以发布的通过示例。
- `fixtures/pyproject.toml` 和 `fixtures/Cargo.toml` 覆盖 Python 和 Rust 版本文件。

建议设置 `GITHUB_TOKEN`，避免 GitHub API 速率限制：

```bash
GITHUB_TOKEN=ghp_xxx releaselint check --repo owner/name --since-tag v1.2.0
```

## GitHub Action

可以直接复制的 workflow 示例见 [`examples/github-action`](examples/github-action)。

当 ReleaseLint 运行在 GitHub Actions 中时，blocker 会输出为 workflow error，warning 会输出为 workflow warning。本地 CLI 默认不会输出 annotations，除非使用 `--annotations always`。

在 `pull_request` workflow 中设置 `comment: true` 后，ReleaseLint 会在 release PR 下发布或更新一条固定的 Markdown 报告评论。此功能默认关闭；因为 GitHub 将 PR 评论存储为 issue comments，所以需要 `issues: write` 权限。

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
      - uses: vaibanbuilds/releaselint@v0.1.3
        with:
          since-tag: ${{ inputs.since-tag }}
          version-file: package.json
```

如果需要 PR 评论报告：

```yaml
permissions:
  contents: read
  pull-requests: read
  issues: write

steps:
  - uses: actions/checkout@v4
  - uses: vaibanbuilds/releaselint@v0.1.3
    with:
      since-tag: v1.2.0
      comment: true
```

## 配置

创建 `.releaselint.json`：

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
    "requireLinkedIssueForClosedIssues": true,
    "requireConventionalCommits": true
  },
  "migrationNoteMarkers": ["migration", "breaking change", "upgrade notes"],
  "issueLinkPatterns": ["fixes #", "closes #", "resolves #"]
}
```

## 当前检查项

ReleaseLint v0.1 会检查：

- 已合并 PR 必须有 release label。
- 标记为 breaking change 的 PR 必须包含迁移说明。
- 非 merge commit 的 message 应符合 conventional commit 格式。
- release label 会推导出 `major`、`minor`、`patch` 或 `none` 的版本建议。
- 如果存在本地 `package.json`、`pyproject.toml` 或 `Cargo.toml`，版本号应与推荐版本变更匹配。
- 已关闭 issue 应该链接到 PR 或 commit，除非标记为 `no-code-change`、`invalid`、`duplicate` 或 `wontfix`。

ReleaseLint 会同时从 issue 正文和已合并 PR 正文中识别关联 issue，例如 `fixes #123`、`closes #123`、`resolves #123`。

## GitHub Actions Annotations

ReleaseLint 可以输出 workflow annotations：

```text
::error title=missing-release-label::PR #44 has no release label
::warning title=closed-issue-without-link::Issue #15 is closed without an obvious PR or commit link
```

Annotation 模式：

- `auto`：仅在 `GITHUB_ACTIONS=true` 时输出 annotations
- `always`：总是输出 annotations
- `never`：从不输出 annotations

## 设计原则

- 确定性优先：AI 可以在未来辅助撰写说明，但发布规则由确定性检查决定。
- 证据优先：每个问题都应能追溯到 PR、issue 或 commit。
- 适合 CI：发现 blocker 时可以用非零退出码阻断发布流程。
- 维护者自主管理：用户使用自己的仓库权限和 token 运行工具。

## 路线图

- 支持更多生态的版本文件格式
- 从 commit message 中识别关联 issue
- 支持 monorepo 包选择
- 可选的 AI 辅助迁移说明和 release notes 草稿

## License

MIT
