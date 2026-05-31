import { readFile } from "node:fs/promises";

const semverRank = { none: 0, patch: 1, minor: 2, major: 3 };

export async function lintRelease(context, config, options = {}) {
  const findings = [];
  const prAnalyses = context.pullRequests.map((pr) => analyzePullRequest(pr, config));
  const recommendedBump = highestBump(prAnalyses.map((item) => item.bump));
  const linkedIssueNumbers = linkedIssuesFromPullRequests(context.pullRequests, config.issueLinkPatterns);

  for (const analysis of prAnalyses) {
    if (config.requirements.requireReleaseLabel && analysis.bump === "unlabeled") {
      findings.push(blocker(
        "missing-release-label",
        `PR #${analysis.pr.number} has no release label`,
        analysis.pr.url,
      ));
    }

    if (
      config.requirements.requireMigrationNotesForBreaking &&
      analysis.bump === "major" &&
      !hasMarker(analysis.pr.body, config.migrationNoteMarkers)
    ) {
      findings.push(blocker(
        "missing-migration-notes",
        `PR #${analysis.pr.number} is breaking but has no migration notes`,
        analysis.pr.url,
      ));
    }
  }

  if (config.requirements.requireLinkedIssueForClosedIssues) {
    for (const issue of context.closedIssues || []) {
      if (hasAnyLabel(issue.labels, ["no-code-change", "invalid", "duplicate", "wontfix"])) continue;
      if (linkedIssueNumbers.has(issue.number)) continue;
      if (!hasMarker(issue.body, config.issueLinkPatterns)) {
        findings.push(warning(
          "closed-issue-without-link",
          `Issue #${issue.number} is closed without an obvious PR or commit link`,
          issue.url,
        ));
      }
    }
  }

  const versionFinding = await checkVersionBump(context.sinceTag, recommendedBump, options);
  if (versionFinding) findings.push(versionFinding);

  return {
    repo: context.repo,
    sinceTag: context.sinceTag,
    headRef: context.headRef,
    summary: summarize(findings),
    recommendedBump,
    pullRequests: prAnalyses,
    findings,
  };
}

function analyzePullRequest(pr, config) {
  return {
    pr,
    bump: bumpForLabels(pr.labels, config.labels),
  };
}

function bumpForLabels(labels, labelConfig) {
  for (const bump of ["major", "minor", "patch", "none"]) {
    if (hasAnyLabel(labels, labelConfig[bump] || [])) return bump;
  }
  return "unlabeled";
}

function highestBump(bumps) {
  return bumps.reduce((highest, bump) => {
    if (bump === "unlabeled") return highest;
    return semverRank[bump] > semverRank[highest] ? bump : highest;
  }, "none");
}

async function checkVersionBump(sinceTag, recommendedBump, options) {
  if (!options.versionFile || recommendedBump === "none") return null;

  try {
    const raw = await readFile(`${options.cwd || process.cwd()}/${options.versionFile}`, "utf8");
    const current = JSON.parse(raw).version;
    const previous = sinceTag.replace(/^v/, "");
    if (!isExpectedBump(previous, current, recommendedBump)) {
      return warning(
        "version-bump-mismatch",
        `Version ${current} does not match recommended ${recommendedBump} bump from ${sinceTag}`,
      );
    }
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }

  return null;
}

function isExpectedBump(previous, current, bump) {
  const before = parseVersion(previous);
  const after = parseVersion(current);
  if (!before || !after) return true;
  if (bump === "major") return after.major > before.major;
  if (bump === "minor") return after.major > before.major || after.minor > before.minor;
  if (bump === "patch") return after.major > before.major || after.minor > before.minor || after.patch > before.patch;
  return true;
}

function parseVersion(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(value);
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

function hasAnyLabel(labels, expected) {
  const normalized = new Set(labels.map((label) => label.toLowerCase()));
  return expected.some((label) => normalized.has(label.toLowerCase()));
}

function hasMarker(text, markers) {
  const normalized = (text || "").toLowerCase();
  return markers.some((marker) => normalized.includes(marker.toLowerCase()));
}

function linkedIssuesFromPullRequests(pullRequests, markers) {
  const linked = new Set();
  const markerPattern = markers
    .map((marker) => marker.replace("#", "").trim())
    .filter(Boolean)
    .map(escapeRegExp)
    .join("|");

  if (!markerPattern) return linked;

  const pattern = new RegExp(`(?:${markerPattern})\\s+#(\\d+)`, "gi");
  for (const pr of pullRequests || []) {
    const text = `${pr.title || ""}\n${pr.body || ""}`;
    for (const match of text.matchAll(pattern)) {
      linked.add(Number(match[1]));
    }
  }

  return linked;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function blocker(rule, message, url) {
  return { severity: "blocker", rule, message, url };
}

function warning(rule, message, url) {
  return { severity: "warning", rule, message, url };
}

function summarize(findings) {
  return {
    blockers: findings.filter((finding) => finding.severity === "blocker").length,
    warnings: findings.filter((finding) => finding.severity === "warning").length,
  };
}
