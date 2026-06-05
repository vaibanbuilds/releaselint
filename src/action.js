import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { currentPullRequestNumber, isTruthy, upsertPullRequestComment } from "./pr-comment.js";

const input = (name) => process.env[`INPUT_${name.toUpperCase().replaceAll("-", "_")}`] || "";
const repo = input("repo") || process.env.GITHUB_REPOSITORY;
const format = input("format") || "markdown";
const shouldComment = isTruthy(input("comment"));

if (shouldComment && format !== "markdown") {
  process.stderr.write("releaselint: comment=true requires format=markdown\n");
  process.exit(1);
}

const cliPath = fileURLToPath(new URL("./cli.js", import.meta.url));
const args = [
  cliPath,
  "check",
  "--repo",
  repo,
  "--since-tag",
  input("since-tag"),
  "--config",
  input("config") || ".releaselint.json",
  "--version-file",
  input("version-file") || "package.json",
  "--format",
  format,
];

const token = input("token");
if (token) args.push("--token", token);

const child = spawn(process.execPath, args, {
  stdio: ["ignore", "pipe", "inherit"],
  env: process.env,
});

let stdout = "";

child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  stdout += text;
  process.stdout.write(text);
});

child.on("error", (error) => {
  process.stderr.write(`releaselint: ${error.message}\n`);
  process.exit(1);
});

child.on("close", async (code) => {
  try {
    if (shouldComment) {
      const pullNumber = await currentPullRequestNumber();
      if (!pullNumber) {
        process.stdout.write("ReleaseLint comment skipped: no pull request event detected.\n");
      } else {
        const result = await upsertPullRequestComment({
          repo,
          pullNumber,
          body: markdownReportFromOutput(stdout),
          token: token || process.env.GITHUB_TOKEN,
        });
        process.stdout.write(`ReleaseLint comment ${result.action} on PR #${pullNumber}.\n`);
      }
    }
  } catch (error) {
    process.stderr.write(`ReleaseLint comment failed: ${error.message}\n`);
    process.exit(1);
  }

  process.exit(code ?? 1);
});

function markdownReportFromOutput(output) {
  return output
    .split(/\r?\n/)
    .filter((line) => !line.startsWith("::error ") && !line.startsWith("::warning "))
    .join("\n")
    .trim();
}
