#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fetchReleaseContext } from "./github.js";
import { loadConfig } from "./config.js";
import { lintRelease } from "./rules.js";
import { renderJson, renderMarkdown } from "./report.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.command !== "check" || args.help) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }

  const config = await loadConfig(args.config);
  const context = args.fixture
    ? JSON.parse(await readFile(resolve(args.fixture), "utf8"))
    : await fetchReleaseContext({
        repo: required(args.repo, "--repo is required unless --fixture is used"),
        sinceTag: required(args.sinceTag, "--since-tag is required unless --fixture is used"),
        token: args.token || process.env.GITHUB_TOKEN,
      });

  const result = await lintRelease(context, config, {
    versionFile: args.versionFile,
    cwd: process.cwd(),
  });

  const output = args.format === "json" ? renderJson(result) : renderMarkdown(result);
  process.stdout.write(`${output}\n`);

  if (result.summary.blockers > 0 && !args.noFail) {
    process.exit(2);
  }
}

function parseArgs(argv) {
  const out = {
    command: argv[0],
    format: "markdown",
    versionFile: "package.json",
  };

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--repo") out.repo = argv[++index];
    else if (arg === "--since-tag") out.sinceTag = argv[++index];
    else if (arg === "--token") out.token = argv[++index];
    else if (arg === "--config") out.config = argv[++index];
    else if (arg === "--fixture") out.fixture = argv[++index];
    else if (arg === "--format") out.format = argv[++index];
    else if (arg === "--version-file") out.versionFile = argv[++index];
    else if (arg === "--no-fail") out.noFail = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!["markdown", "json"].includes(out.format)) {
    throw new Error("--format must be markdown or json");
  }

  return out;
}

function required(value, message) {
  if (!value) throw new Error(message);
  return value;
}

function printHelp() {
  process.stdout.write(`ReleaseLint

Usage:
  releaselint check --repo owner/name --since-tag v1.2.0
  releaselint check --fixture fixtures/sample-release.json

Options:
  --repo <owner/name>          GitHub repository to inspect
  --since-tag <tag>           Base tag for release readiness checks
  --token <token>             GitHub token, defaults to GITHUB_TOKEN
  --config <path>             JSON config path, defaults to .releaselint.json
  --fixture <path>            Read release context from a local JSON fixture
  --format <markdown|json>    Output format, defaults to markdown
  --version-file <path>       Version file to inspect, defaults to package.json
  --no-fail                   Always exit 0 even when blockers are found
`);
}

main().catch((error) => {
  process.stderr.write(`releaselint: ${error.message}\n`);
  process.exit(1);
});
