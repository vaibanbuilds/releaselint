import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const input = (name) => process.env[`INPUT_${name.toUpperCase().replaceAll("-", "_")}`] || "";
const repo = input("repo") || process.env.GITHUB_REPOSITORY;
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
  input("format") || "markdown",
];

const token = input("token");
if (token) args.push("--token", token);

const child = spawn(process.execPath, args, {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
