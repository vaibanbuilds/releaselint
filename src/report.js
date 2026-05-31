export function renderJson(result) {
  return JSON.stringify(result, null, 2);
}

export function renderMarkdown(result) {
  const status = result.summary.blockers > 0 ? "Needs attention" : "Ready";
  const lines = [
    "# ReleaseLint Report",
    "",
    `Repository: ${result.repo}`,
    `Range: ${result.sinceTag}...${result.headRef}`,
    `Status: ${status}`,
    "",
    "## Summary",
    "",
    `- Recommended bump: ${result.recommendedBump}`,
    `- Blockers: ${result.summary.blockers}`,
    `- Warnings: ${result.summary.warnings}`,
    "",
  ];

  if (result.findings.length > 0) {
    lines.push("## Findings", "");
    for (const finding of result.findings) {
      const link = finding.url ? ` ([source](${finding.url}))` : "";
      lines.push(`- **${finding.severity}** \`${finding.rule}\`: ${finding.message}${link}`);
    }
    lines.push("");
  }

  lines.push("## Pull Request Evidence", "");
  for (const item of result.pullRequests) {
    lines.push(`- #${item.pr.number} ${item.pr.title} — \`${item.bump}\``);
  }

  return lines.join("\n");
}
