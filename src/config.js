import { readFile, writeFile } from "node:fs/promises";

const topLevelKeys = ["labels", "requirements", "migrationNoteMarkers", "issueLinkPatterns"];
const labelKeys = ["major", "minor", "patch", "none"];
const requirementKeys = [
  "requireReleaseLabel",
  "requireMigrationNotesForBreaking",
  "requireLinkedIssueForClosedIssues",
];

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
    const config = await readConfig(path);
    return mergeConfig(defaultConfig, config);
  } catch (error) {
    if (error.code === "ENOENT") return defaultConfig;
    throw error;
  }
}

export async function readConfig(path = ".releaselint.json") {
  let config;
  try {
    const raw = await readFile(path, "utf8");
    config = JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`${path} is not valid JSON: ${error.message}`);
    }
    throw error;
  }

  const errors = validateConfig(config);
  if (errors.length > 0) {
    throw new Error([`${path} is not a valid ReleaseLint config:`, ...errors.map((error) => `- ${error}`)].join("\n"));
  }

  return config;
}

export function renderDefaultConfig() {
  return `${JSON.stringify(defaultConfig, null, 2)}\n`;
}

export async function writeDefaultConfig(path = ".releaselint.json", options = {}) {
  const flag = options.force ? "w" : "wx";
  await writeFile(path, renderDefaultConfig(), { flag });
}

export function validateConfig(config) {
  const errors = [];

  if (!isPlainObject(config)) {
    return ["config must be a JSON object"];
  }

  for (const key of Object.keys(config)) {
    if (!topLevelKeys.includes(key)) {
      errors.push(`unknown top-level field "${key}"`);
    }
  }

  if ("labels" in config) validateStringArrayMap(config.labels, "labels", labelKeys, errors);
  if ("requirements" in config) validateBooleanMap(config.requirements, "requirements", requirementKeys, errors);
  if ("migrationNoteMarkers" in config) validateStringArray(config.migrationNoteMarkers, "migrationNoteMarkers", errors);
  if ("issueLinkPatterns" in config) validateStringArray(config.issueLinkPatterns, "issueLinkPatterns", errors);

  return errors;
}

function mergeConfig(base, override) {
  return {
    ...base,
    ...override,
    labels: { ...base.labels, ...override.labels },
    requirements: { ...base.requirements, ...override.requirements },
  };
}

function validateStringArrayMap(value, name, allowedKeys, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${name} must be an object`);
    return;
  }

  for (const [key, items] of Object.entries(value)) {
    if (!allowedKeys.includes(key)) {
      errors.push(`unknown ${name} field "${key}"`);
      continue;
    }
    validateStringArray(items, `${name}.${key}`, errors);
  }
}

function validateBooleanMap(value, name, allowedKeys, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${name} must be an object`);
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    if (!allowedKeys.includes(key)) {
      errors.push(`unknown ${name} field "${key}"`);
      continue;
    }
    if (typeof item !== "boolean") {
      errors.push(`${name}.${key} must be a boolean`);
    }
  }
}

function validateStringArray(value, name, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${name} must be an array of strings`);
    return;
  }

  if (value.length === 0) {
    errors.push(`${name} must not be empty`);
  }

  value.forEach((item, index) => {
    if (typeof item !== "string") {
      errors.push(`${name}[${index}] must be a string`);
    } else if (item.trim() === "") {
      errors.push(`${name}[${index}] must not be empty`);
    }
  });
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
