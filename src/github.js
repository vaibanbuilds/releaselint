const apiBase = "https://api.github.com";

export async function fetchReleaseContext({ repo, sinceTag, token }) {
  const [owner, name] = repo.split("/");
  if (!owner || !name) throw new Error("--repo must use owner/name format");

  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "releaselint",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const repository = await github(`/repos/${owner}/${name}`, headers);
  const compare = await github(
    `/repos/${owner}/${name}/compare/${encodeURIComponent(sinceTag)}...${repository.default_branch}`,
    headers,
  );

  const mergedPullRequests = await pullRequestsForCommits(owner, name, compare.commits, headers);
  const since = compare.base_commit?.commit?.committer?.date;
  const closedIssues = since
    ? await searchClosedIssues(owner, name, since, headers)
    : [];

  return {
    repo,
    sinceTag,
    headRef: repository.default_branch,
    commits: compare.commits.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      url: commit.html_url,
    })),
    pullRequests: mergedPullRequests,
    closedIssues,
  };
}

async function pullRequestsForCommits(owner, repo, commits, headers) {
  const byNumber = new Map();

  for (const commit of commits.slice(-100)) {
    const pulls = await github(
      `/repos/${owner}/${repo}/commits/${commit.sha}/pulls`,
      { ...headers, Accept: "application/vnd.github.groot-preview+json" },
    );

    for (const pr of pulls) {
      if (!pr.merged_at) continue;
      byNumber.set(pr.number, normalizePullRequest(pr));
    }
  }

  return [...byNumber.values()].sort((a, b) => a.number - b.number);
}

async function searchClosedIssues(owner, repo, since, headers) {
  const query = encodeURIComponent(`repo:${owner}/${repo} is:issue is:closed closed:>=${since.slice(0, 10)}`);
  const data = await github(`/search/issues?q=${query}&per_page=100`, headers);
  return data.items.map((issue) => ({
    number: issue.number,
    title: issue.title,
    labels: issue.labels.map((label) => label.name),
    body: issue.body || "",
    url: issue.html_url,
  }));
}

function normalizePullRequest(pr) {
  return {
    number: pr.number,
    title: pr.title,
    labels: pr.labels.map((label) => label.name),
    body: pr.body || "",
    url: pr.html_url,
    mergedAt: pr.merged_at,
    author: pr.user?.login,
  };
}

async function github(path, headers) {
  const response = await fetch(`${apiBase}${path}`, { headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${response.status} for ${path}: ${text.slice(0, 240)}`);
  }
  return response.json();
}
