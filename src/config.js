import { readFile, writeFile } from "node:fs/promises";

export const defaultConfig = {
  labels: {
    major: ["breaking-change", "breaking"],
    minor: ["feature", "feat", "enhancement"],
    patch: ["bug", "bugfix", "fix"],
    none: ["docs", "documentation", "chore", "internal", "test"],
  },
  requirements: {
    requireReleaseLabel: true,
    requireMigrationNotesForBreaking: true,
    requireLinkedIssueForClosedIssues: true,
  },
  migrationNoteMarkers: ["migration", "breaking change", "upgrade notes"],
  issueLinkPatterns: ["fixes #", "closes #", "resolves #"],
};

export async function loadConfig(path = ".releaselint.json") {
  try {
    const raw = await readFile(path, "utf8");
    return mergeConfig(defaultConfig, JSON.parse(raw));
  } catch (error) {
    if (error.code === "ENOENT") return defaultConfig;
    throw error;
  }
}

export function renderDefaultConfig() {
  return `${JSON.stringify(defaultConfig, null, 2)}\n`;
}

export async function writeDefaultConfig(path = ".releaselint.json", options = {}) {
  const flag = options.force ? "w" : "wx";
  await writeFile(path, renderDefaultConfig(), { flag });
}

function mergeConfig(base, override) {
  return {
    ...base,
    ...override,
    labels: { ...base.labels, ...override.labels },
    requirements: { ...base.requirements, ...override.requirements },
  };
}
