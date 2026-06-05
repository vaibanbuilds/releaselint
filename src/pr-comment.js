import { readFile } from "node:fs/promises";

const apiBase = "https://api.github.com";
export const COMMENT_MARKER = "<!-- releaselint:report -->";

export function isTruthy(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

export async function currentPullRequestNumber(env = process.env) {
  const eventName = env.GITHUB_EVENT_NAME || "";
  const eventPath = env.GITHUB_EVENT_PATH;
  if (!eventName.includes("pull_request") || !eventPath) return null;

  const event = JSON.parse(await readFile(eventPath, "utf8"));
  return event.pull_request?.number || null;
}

export async function upsertPullRequestComment({ repo, pullNumber, body, token, marker = COMMENT_MARKER }) {
  if (!token) {
    throw new Error("comment=true requires a GitHub token");
  }

  if (!body.trim()) {
    throw new Error("cannot post an empty ReleaseLint report");
  }

  const { owner, name } = parseRepo(repo);
  const commentBody = `${marker}\n${body.trim()}\n\n_Updated by ReleaseLint._`;
  const comments = await github(
    `/repos/${owner}/${name}/issues/${pullNumber}/comments?per_page=100`,
    { token },
  );
  const existing = comments.find((comment) => comment.body?.includes(marker));

  if (existing) {
    await github(`/repos/${owner}/${name}/issues/comments/${existing.id}`, {
      method: "PATCH",
      token,
      body: { body: commentBody },
    });
    return { action: "updated", id: existing.id, url: existing.html_url };
  }

  const created = await github(`/repos/${owner}/${name}/issues/${pullNumber}/comments`, {
    method: "POST",
    token,
    body: { body: commentBody },
  });
  return { action: "created", id: created.id, url: created.html_url };
}

function parseRepo(repo) {
  const [owner, name] = String(repo || "").split("/");
  if (!owner || !name) {
    throw new Error("repo must use owner/name format");
  }
  return { owner, name };
}

async function github(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "releaselint",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${response.status} for ${path}: ${text.slice(0, 240)}`);
  }

  return response.json();
}
