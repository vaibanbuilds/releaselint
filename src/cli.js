#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fetchReleaseContext } from "./github.js";
import { loadConfig, renderDefaultConfig, writeDefaultConfig } from "./config.js";
import { lintRelease } from "./rules.js";
import { renderJson, renderMarkdown } from "./report.js";
import { renderAnnotations, shouldEmitAnnotations } from "./annotations.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.command === "init") {
    await initConfig(args);
    return;
  }

  if (args.command !== "check") {
    printHelp();
    process.exit(1);
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

  if (shouldEmitAnnotations(args.annotations) && result.findings.length > 0) {
    process.stdout.write(`${renderAnnotations(result)}\n`);
  }

  if (result.summary.blockers > 0 && !args.noFail) {
    process.exit(2);
  }
}

async function initConfig(args) {
  if (args.print) {
    process.stdout.write(renderDefaultConfig());
    return;
  }

  try {
    await writeDefaultConfig(args.config, { force: args.force });
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(`${args.config} already exists; use --force to overwrite it`);
    }
    throw error;
  }

  process.stdout.write(`Created ${args.config}\n`);
}

function parseArgs(argv) {
  const out = {
    command: argv[0],
    config: ".releaselint.json",
    format: "markdown",
    versionFile: "package.json",
    annotations: "auto",
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
    else if (arg === "--annotations") out.annotations = argv[++index];
    else if (arg === "--no-fail") out.noFail = true;
    else if (arg === "--force") out.force = true;
    else if (arg === "--print") out.print = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!["markdown", "json"].includes(out.format)) {
    throw new Error("--format must be markdown or json");
  }
  if (!["auto", "always", "never"].includes(out.annotations)) {
    throw new Error("--annotations must be auto, always, or never");
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
  releaselint init
  releaselint check --repo owner/name --since-tag v1.2.0
  releaselint check --fixture fixtures/sample-release.json

Options:
  --force                    Overwrite an existing .releaselint.json when using init
  --print                    Print the default config instead of writing it
  --repo <owner/name>          GitHub repository to inspect
  --since-tag <tag>           Base tag for release readiness checks
  --token <token>             GitHub token, defaults to GITHUB_TOKEN
  --config <path>             JSON config path, defaults to .releaselint.json
  --fixture <path>            Read release context from a local JSON fixture
  --format <markdown|json>    Output format, defaults to markdown
  --version-file <path>       Version file to inspect, defaults to package.json
  --annotations <mode>        Emit GitHub Actions annotations: auto, always, or never
  --no-fail                   Always exit 0 even when blockers are found
`);
}

main().catch((error) => {
  process.stderr.write(`releaselint: ${error.message}\n`);
  process.exit(1);
});
