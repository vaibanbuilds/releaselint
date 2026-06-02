export function shouldEmitAnnotations(mode, env = process.env) {
  if (mode === "always") return true;
  if (mode === "never") return false;
  return env.GITHUB_ACTIONS === "true";
}

export function renderAnnotations(result) {
  return result.findings
    .map((finding) => {
      const command = finding.severity === "blocker" ? "error" : "warning";
      const title = escapeProperty(finding.rule);
      return `::${command} title=${title}::${escapeMessage(finding.message)}`;
    })
    .join("\n");
}

function escapeMessage(value) {
  return String(value)
    .replaceAll("%", "%25")
    .replaceAll("\r", "%0D")
    .replaceAll("\n", "%0A");
}

function escapeProperty(value) {
  return escapeMessage(value)
    .replaceAll(":", "%3A")
    .replaceAll(",", "%2C");
}
