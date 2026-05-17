const BASE = "https://api.github.com";

/** Parse "owner/repo" from any GitHub URL shape */
export function parseGitHubUrl(url) {
  try {
    const cleaned = url.trim().replace(/\.git$/, "").replace(/\/$/, "");
    const match = cleaned.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  } catch {
    return null;
  }
}

/** Fetch JSON from GitHub API with proper headers */
async function ghFetch(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new GHError(res.status, err.message || res.statusText, path);
  }
  return res.json();
}

export class GHError extends Error {
  constructor(status, message, path) {
    super(message);
    this.status = status;
    this.path   = path;
    this.name   = "GHError";
  }
}

/** ── Main fetcher: gathers everything in parallel ── */
export async function analyzeRepo(owner, repo) {
  // Fire all parallel requests
  const [info, languages, contributors, commits, activity, readmeRaw] =
    await Promise.allSettled([
      ghFetch(`/repos/${owner}/${repo}`),
      ghFetch(`/repos/${owner}/${repo}/languages`),
      ghFetch(`/repos/${owner}/${repo}/contributors?per_page=5&anon=1`),
      ghFetch(`/repos/${owner}/${repo}/commits?per_page=1`),
      ghFetch(`/repos/${owner}/${repo}/stats/commit_activity`),
      ghFetch(`/repos/${owner}/${repo}/readme`),
    ]);

  // core info is mandatory — rethrow if it failed
  if (info.status === "rejected") throw info.reason;

  const data = info.value;

  // README — decode base64 if present
  let readmeText = "";
  if (readmeRaw.status === "fulfilled") {
    try {
      readmeText = atob(readmeRaw.value.content.replace(/\n/g, ""));
    } catch {
      readmeText = "";
    }
  }

  // Languages map → array sorted by bytes
  const langMap = languages.status === "fulfilled" ? languages.value : {};
  const totalBytes = Object.values(langMap).reduce((a, b) => a + b, 0) || 1;
  const techStack = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, bytes]) => ({
      name,
      bytes,
      pct: Math.round((bytes / totalBytes) * 100),
    }));

  // Contributors
  const contributorList =
    contributors.status === "fulfilled" ? contributors.value : [];
  const totalContributors = data.subscribers_count ?? contributorList.length;

  // Last commit SHA short
  const lastCommitSha =
    commits.status === "fulfilled" && commits.value[0]
      ? commits.value[0].sha.slice(0, 7)
      : null;

  // Weekly commit activity (last 12 weeks)
  let weeklyActivity = [];
  if (activity.status === "fulfilled" && Array.isArray(activity.value)) {
    weeklyActivity = activity.value.slice(-12).map((w, i) => ({
      week: `W${i + 1}`,
      commits: w.total,
    }));
  }

  // File tree (best-effort — large repos may 409/truncate)
  let fileTree = [];
  try {
    const tree = await ghFetch(
      `/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`
    );
    fileTree = tree.tree || [];
  } catch {
    fileTree = [];
  }

  return {
    // Core
    owner,
    repo,
    repoName: data.full_name,
    repoUrl:  data.html_url,
    description: data.description || "No description provided.",
    stars:    data.stargazers_count,
    forks:    data.forks_count,
    openIssues: data.open_issues_count,
    watchers: data.watchers_count,
    language: data.language || "Unknown",
    license:  data.license?.spdx_id || data.license?.name || "None",
    isPrivate: data.private,
    isFork:   data.fork,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    pushedAt:  data.pushed_at,
    defaultBranch: data.default_branch,
    size:     data.size, // KB
    topics:   data.topics || [],
    homepage: data.homepage || null,

    // Owner
    ownerLogin:  data.owner.login,
    ownerAvatar: data.owner.avatar_url,
    ownerType:   data.owner.type, // "User" | "Organization"

    // Derived
    techStack,
    contributorList,
    totalContributors,
    lastCommitSha,
    weeklyActivity,
    fileTree,
    readmeText,

    // Raw for extra use
    _raw: data,
  };
}
