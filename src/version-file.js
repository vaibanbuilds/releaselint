export function readVersion(raw, versionFile) {
  const normalized = versionFile.replaceAll("\\", "/").toLowerCase();

  if (normalized.endsWith(".json")) {
    return JSON.parse(raw).version;
  }

  if (normalized.endsWith("pyproject.toml")) {
    return readTomlVersion(raw, "project");
  }

  if (normalized.endsWith("cargo.toml")) {
    return readTomlVersion(raw, "package");
  }

  throw new Error(
    `Unsupported version file format: ${versionFile}. Supported formats: package.json, pyproject.toml, Cargo.toml`,
  );
}

function readTomlVersion(raw, expectedSection) {
  let currentSection = "";

  for (const line of raw.split(/\r?\n/)) {
    const section = /^\s*\[([^\]]+)\]\s*(?:#.*)?$/.exec(line);
    if (section) {
      currentSection = section[1].trim().toLowerCase();
      continue;
    }

    if (currentSection !== expectedSection) continue;

    const version = /^\s*version\s*=\s*["']([^"']+)["']/.exec(line);
    if (version) return version[1];
  }

  return null;
}
