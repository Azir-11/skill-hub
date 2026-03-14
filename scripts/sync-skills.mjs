import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DATA_PATH = path.join(process.cwd(), "data", "skills.json");
const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_WEB_BASE = "https://github.com";
const SELF_REPO = "Azir-11/skill-hub";
const SELF_REPO_BRANCH = "main";
const SELF_SKILL_PATH_PREFIX = "data/skills";

let hasLoggedRateLimitFallback = false;

function extractGitHubTarget(skill) {
  if (skill.github_url === "self") {
    const skillPath = `${SELF_SKILL_PATH_PREFIX}/${skill.name}`;
    return {
      ownerRepo: SELF_REPO,
      ref: SELF_REPO_BRANCH,
      path: skillPath,
      webUrl: `${GITHUB_WEB_BASE}/${SELF_REPO}/tree/${SELF_REPO_BRANCH}/${skillPath}`,
    };
  }

  try {
    const url = new URL(skill.github_url);
    const parts = url.pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part));
    if (parts.length < 2) {
      return null;
    }

    const ownerRepo = `${parts[0]}/${parts[1]}`;
    const ref = parts[2] === "tree" && parts[3] ? parts[3] : null;
    const directoryPath = parts[2] === "tree" && parts.length > 4 ? parts.slice(4).join("/") : null;

    return {
      ownerRepo,
      ref,
      path: directoryPath,
      webUrl: skill.github_url,
    };
  } catch {
    return null;
  }
}

async function requestGitHub(endpoint) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "skill-hub-sync-script",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { headers });
  const message = await response.text();

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`GitHub API 请求失败 ${response.status}: ${message}`);
  }

  return JSON.parse(message);
}

const isGitHubApiRateLimitError = (error) =>
  error instanceof Error &&
  error.message.includes("GitHub API 请求失败 403") &&
  error.message.toLowerCase().includes("rate limit exceeded");

const logRateLimitFallback = () => {
  if (hasLoggedRateLimitFallback) {
    return;
  }

  hasLoggedRateLimitFallback = true;
  process.stderr.write("GitHub API 已触发限流，后续改用 GitHub 页面回退。\n");
};

async function requestGitHubText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/atom+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent": "skill-hub-sync-script",
    },
    redirect: "follow",
  });

  if (response.status === 404) {
    return null;
  }

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`GitHub 页面请求失败 ${response.status}: ${body}`);
  }

  return {
    body,
    url: response.url,
  };
}

const parseStarCount = (value) => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase().replace(/,/g, "").replace(/\s+/g, "");

  const match = normalized.match(/^(\d+(?:\.\d+)?)([km])?$/);
  if (!match) {
    return null;
  }

  const base = Number(match[1]);
  if (Number.isNaN(base)) {
    return null;
  }

  switch (match[2]) {
    case "k":
      return Math.round(base * 1000);
    case "m":
      return Math.round(base * 1000000);
    default:
      return Math.round(base);
  }
};

const extractRepoMetadataFromHtml = (html) => {
  const starPatterns = [
    /id="repo-stars-counter-star"[^>]*title="([^"]+)"/i,
    /repo-stars-counter-star[\s\S]*?aria-label="([^"]+?) users starred this repository"/i,
    /"interactionStatistic":\s*\[\s*\{\s*"@type":"InteractionCounter","interactionType":\{"@type":"https:\/\/schema\.org\/WatchAction"\},"userInteractionCount":(\d+)/i,
  ];

  let stars = null;
  for (const pattern of starPatterns) {
    const match = html.match(pattern);
    if (!match) {
      continue;
    }

    const rawValue = match[1].replace(/ users starred this repository/i, "");
    stars = /^\d+$/.test(rawValue) ? Number(rawValue) : parseStarCount(rawValue);
    if (typeof stars === "number") {
      break;
    }
  }

  const updatedMatch =
    html.match(/datetime="([^"]+)"[^>]*data-view-component="true"/i) ??
    html.match(/<relative-time[^>]*datetime="([^"]+)"/i) ??
    html.match(/<time-ago[^>]*datetime="([^"]+)"/i);

  return {
    stars,
    updated_at: updatedMatch?.[1] ?? null,
  };
};

async function fetchRepoMetadataFromWeb(ownerRepo) {
  const result = await requestGitHubText(`${GITHUB_WEB_BASE}/${ownerRepo}`);
  if (!result) {
    return null;
  }

  return extractRepoMetadataFromHtml(result.body);
}

const extractCommitMetadataFromHtml = (html) => {
  const shortShaMatch =
    html.match(/href="\/[^"/]+\/[^"/]+\/commit\/([0-9a-f]{7,40})"/i) ??
    html.match(/data-testid="commit-oid"[^>]*>\s*([0-9a-f]{7,40})\s*</i);
  const committedAtMatch =
    html.match(/<relative-time[^>]*datetime="([^"]+)"/i) ??
    html.match(/<time-ago[^>]*datetime="([^"]+)"/i) ??
    html.match(/datetime="([^"]+)"[^>]*data-view-component="true"/i);

  return {
    version: shortShaMatch?.[1]?.slice(0, 7) ?? null,
    updated_at: committedAtMatch?.[1] ?? null,
  };
};

async function fetchCommitMetadataFromWeb(target, fallback) {
  const result = await requestGitHubText(target.webUrl ?? `${GITHUB_WEB_BASE}/${target.ownerRepo}`);
  if (!result) {
    return fallback;
  }

  const commit = extractCommitMetadataFromHtml(result.body);
  return {
    version: commit.version ?? fallback.version ?? null,
    updated_at: commit.updated_at ?? fallback.updated_at ?? null,
  };
}

async function fetchRepoMetadata(ownerRepo, skill) {
  try {
    const repo = await requestGitHub(`/repos/${ownerRepo}`);
    if (!repo) {
      return null;
    }

    return {
      stars:
        typeof repo.stargazers_count === "number" ? repo.stargazers_count : (skill.stars ?? null),
      updated_at:
        typeof repo.updated_at === "string" ? repo.updated_at : (skill.updated_at ?? null),
    };
  } catch (error) {
    if (!isGitHubApiRateLimitError(error)) {
      throw error;
    }

    logRateLimitFallback();
    const repo = await fetchRepoMetadataFromWeb(ownerRepo);
    return {
      stars: repo?.stars ?? skill.stars ?? null,
      updated_at: repo?.updated_at ?? skill.updated_at ?? null,
    };
  }
}

async function fetchLatestCommitMetadata(target, skill) {
  const params = new URLSearchParams({ per_page: "1" });
  if (target.ref) {
    params.set("sha", target.ref);
  }
  if (target.path) {
    params.set("path", target.path);
  }

  try {
    const commits = await requestGitHub(`/repos/${target.ownerRepo}/commits?${params.toString()}`);
    const latestCommit = Array.isArray(commits) ? commits[0] : null;
    if (!latestCommit) {
      return {
        version: skill.version ?? null,
        updated_at: skill.updated_at ?? null,
      };
    }

    return {
      version:
        typeof latestCommit.sha === "string" ? latestCommit.sha.slice(0, 7) : (skill.version ?? null),
      updated_at:
        latestCommit.commit?.author?.date ??
        latestCommit.commit?.committer?.date ??
        skill.updated_at ??
        null,
    };
  } catch (error) {
    if (!isGitHubApiRateLimitError(error)) {
      throw error;
    }

    logRateLimitFallback();
    return fetchCommitMetadataFromWeb(target, {
      version: skill.version ?? null,
      updated_at: skill.updated_at ?? null,
    });
  }
}

async function syncSkill(skill) {
  const target = extractGitHubTarget(skill);
  if (!target) {
    return skill;
  }

  const repo = await fetchRepoMetadata(target.ownerRepo, skill);
  if (!repo) {
    return skill;
  }

  const latestCommit = await fetchLatestCommitMetadata(target, skill);

  return {
    ...skill,
    version: latestCommit.version,
    stars: repo.stars,
    updated_at: latestCommit.updated_at ?? repo.updated_at,
  };
}

async function main() {
  const raw = await readFile(DATA_PATH, "utf8");
  const skills = JSON.parse(raw);

  const nextSkills = [];
  for (const skill of skills) {
    process.stdout.write(`同步 ${skill.name}...\n`);
    try {
      nextSkills.push(await syncSkill(skill));
    } catch (error) {
      process.stderr.write(`跳过 ${skill.name}: ${error.message}\n`);
      nextSkills.push(skill);
    }
  }

  await writeFile(`${DATA_PATH}`, `${JSON.stringify(nextSkills, null, 2)}\n`, "utf8");
  process.stdout.write(`已写入 ${DATA_PATH}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
