# Codex 迁移部署文档

这份文档用于把 ReleaseLint 的 Codex 项目上下文迁移到另一台电脑，避免新电脑上的 Codex 没有记忆、需要从头解释项目背景。

## 迁移目标

换电脑后，新的 Codex 应该能快速知道：

- 这个项目是 `vaibanbuilds/releaselint`
- 当前 npm 包是 `@vaibanbuilds/releaselint`
- 当前已发布版本是 `0.1.2`
- `main` 上已经有 `v0.1.3` 候选功能，但还没有发布
- OpenAI Codex for Open Source 申请已经提交，暂时不要重复提交
- 维护节奏要自然，不要为了申请刻意刷提交
- 不要要求用户粘贴 token、OTP、恢复码或 API key

## 仓库里已经准备好的迁移文件

仓库根目录：

```text
CODEX_HANDOFF.md
CODEX_TRANSFER_DEPLOYMENT.zh-CN.md
```

Skill 目录：

```text
codex-skills/releaselint-maintainer/
  SKILL.md
  agents/openai.yaml
  references/project-context.md
```

其中：

- `CODEX_HANDOFF.md` 是项目交接摘要，适合任何 Codex 先读。
- `CODEX_TRANSFER_DEPLOYMENT.zh-CN.md` 是这份迁移部署说明。
- `codex-skills/releaselint-maintainer` 是可安装到 Codex 的本地 skill。

## 方案 A：不安装 skill，只让 Codex 读取交接文档

这是最简单的方式。

在新电脑上：

1. Clone 仓库。

```powershell
git clone https://github.com/vaibanbuilds/releaselint.git
cd releaselint
```

2. 打开 Codex，让它先读交接文档。

可以直接对 Codex 说：

```text
请先读取 CODEX_HANDOFF.md 和 CODEX_TRANSFER_DEPLOYMENT.zh-CN.md，然后继续维护这个 ReleaseLint 项目。
```

这个方式不需要安装任何额外文件，适合临时使用。

## 方案 B：安装 releaselint-maintainer skill

这是推荐方式。安装后，新电脑上的 Codex 更容易自动识别这个项目的维护上下文。

### Windows PowerShell

在新电脑 clone 仓库后，进入仓库目录，然后运行：

```powershell
$repo = (Get-Location).Path
$skillRoot = "$env:USERPROFILE\.codex\skills"
$dest = "$skillRoot\releaselint-maintainer"

New-Item -ItemType Directory -Force -Path $skillRoot | Out-Null

if (Test-Path $dest) {
  Remove-Item -Recurse -Force $dest
}

Copy-Item -Recurse -LiteralPath "$repo\codex-skills\releaselint-maintainer" -Destination $dest
```

安装完成后，目录应该是：

```text
C:\Users\<你的用户名>\.codex\skills\releaselint-maintainer
```

### macOS / Linux

在新电脑 clone 仓库后，进入仓库目录，然后运行：

```bash
mkdir -p ~/.codex/skills
rm -rf ~/.codex/skills/releaselint-maintainer
cp -R ./codex-skills/releaselint-maintainer ~/.codex/skills/releaselint-maintainer
```

## 安装后如何使用

安装 skill 后，打开一个新的 Codex 会话，对它说：

```text
请使用 releaselint-maintainer skill，并先读取 CODEX_HANDOFF.md，然后继续维护 vaibanbuilds/releaselint。
```

如果 Codex 没有自动触发 skill，就直接指定：

```text
请读取 codex-skills/releaselint-maintainer/SKILL.md，并按照里面的流程继续维护项目。
```

## 新电脑上的账号检查

新电脑第一次维护前，先检查这些状态。

```powershell
git status -sb
npm whoami
npm view @vaibanbuilds/releaselint version dist-tags --json
```

如果 `npm whoami` 没有显示 `vaibanbuilds`，先不要发布 npm。

## 新电脑上的标准验证命令

开发或发布前运行：

```powershell
npm run check
npm run check:json
npm run check:passing
npm run check:pyproject
npm run check:cargo
npm run check:annotations
npm pack --dry-run
```

## 后续如何保持迁移资料不过期

每次发生以下变化时，都要更新 `CODEX_HANDOFF.md` 和 `codex-skills/releaselint-maintainer/references/project-context.md`：

- 发布新版本
- npm latest 变化
- OpenAI 官方回复
- open issue 状态变化
- 下一步维护节奏变化
- 重要安全状态变化，例如 token、2FA、发布权限

更新后提交到 GitHub：

```powershell
git add CODEX_HANDOFF.md CODEX_TRANSFER_DEPLOYMENT.zh-CN.md codex-skills/releaselint-maintainer
git commit -m "docs: update Codex handoff context"
git push origin main
```

## 安全规则

- 不要把 npm token、GitHub token、OTP 验证码、恢复码、OpenAI API key 发给 Codex。
- 如果 npm 发布需要临时 token，发布后立刻删除。
- 不要伪造 star、下载量、issue、用户或使用记录。
- 不要重复提交 OpenAI 申请，除非官方拒绝或要求补充材料。

## 最短恢复提示词

如果你只想复制一句话给新电脑上的 Codex，用这句：

```text
请先读取 CODEX_HANDOFF.md 和 CODEX_TRANSFER_DEPLOYMENT.zh-CN.md；如果可以，请使用 releaselint-maintainer skill。这个项目是 vaibanbuilds/releaselint，目前 npm latest 是 0.1.2，main 上有 v0.1.3 候选功能，暂时不要重复提交 OpenAI 申请，也不要要求我粘贴任何 token 或验证码。
```
