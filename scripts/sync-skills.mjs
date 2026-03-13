import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DATA_PATH = path.join(process.cwd(), "data", "skills.json");
const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_WEB_BASE = "https://github.com";

let hasLoggedRateLimitFallback = false;

function extractOwnerRepo(githubUrl) {
  try {
    const url = new URL(githubUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) {
      return null;
    }

    return `${parts[0]}/${parts[1]}`;
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
  error instanceof Error
  && error.message.includes("GitHub API 请求失败 403")
  && error.message.toLowerCase().includes("rate limit exceeded");

const logRateLimitFallback = () => {
  if (hasLoggedRateLimitFallback) {
    return;
  }

  hasLoggedRateLimitFallback = true;
  process.stderr.write("GitHub API 已触发限流，后续改用 GitHub 页面和 Atom feed 回退。\n");
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

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/\s+/g, "");

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
}

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

  const updatedMatch = html.match(/datetime="([^"]+)"[^>]*data-view-component="true"/i)
    ?? html.match(/<relative-time[^>]*datetime="([^"]+)"/i)
    ?? html.match(/<time-ago[^>]*datetime="([^"]+)"/i);

  return {
    stars,
    updated_at: updatedMatch?.[1] ?? null,
  };
}

async function fetchRepoMetadataFromWeb(ownerRepo) {
  const result = await requestGitHubText(`${GITHUB_WEB_BASE}/${ownerRepo}`);
  if (!result) {
    return null;
  }

  return extractRepoMetadataFromHtml(result.body);
}

const extractFirstAtomTagTitle = (xml) => {
  const entryMatch = xml.match(/<entry>[\s\S]*?<title>([^<]+)<\/title>/i);
  return entryMatch?.[1]?.trim() ?? null;
}

const extractFirstAtomUpdated = (xml) => {
  const updatedMatch = xml.match(/<updated>([^<]+)<\/updated>/i);
  return updatedMatch?.[1]?.trim() ?? null;
}

async function resolveVersionFromWeb(ownerRepo, fallbackVersion) {
  const latestRelease = await requestGitHubText(`${GITHUB_WEB_BASE}/${ownerRepo}/releases/latest`);
  if (latestRelease) {
    const tagMatch = latestRelease.url.match(/\/releases\/tag\/([^/?#]+)/i);
    if (tagMatch?.[1]) {
      return decodeURIComponent(tagMatch[1]);
    }
  }

  const tagsFeed = await requestGitHubText(`${GITHUB_WEB_BASE}/${ownerRepo}/tags.atom`);
  const tagName = tagsFeed ? extractFirstAtomTagTitle(tagsFeed.body) : null;
  if (tagName) {
    return tagName;
  }

  return fallbackVersion ?? null;
}

async function fetchRepoMetadata(ownerRepo, skill) {
  try {
    const repo = await requestGitHub(`/repos/${ownerRepo}`);
    if (!repo) {
      return null;
    }

    return {
      stars: typeof repo.stargazers_count === "number" ? repo.stargazers_count : skill.stars ?? null,
      updated_at: typeof repo.updated_at === "string" ? repo.updated_at : skill.updated_at ?? null,
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

async function resolveVersion(ownerRepo, fallbackVersion) {
  try {
    const release = await requestGitHub(`/repos/${ownerRepo}/releases/latest`);
    if (release?.tag_name) {
      return release.tag_name;
    }

    const tags = await requestGitHub(`/repos/${ownerRepo}/tags?per_page=1`);
    if (Array.isArray(tags) && tags[0]?.name) {
      return tags[0].name;
    }
  } catch (error) {
    if (!isGitHubApiRateLimitError(error)) {
      throw error;
    }

    logRateLimitFallback();
    return resolveVersionFromWeb(ownerRepo, fallbackVersion);
  }

  return fallbackVersion ?? null;
}

async function syncSkill(skill) {
  const ownerRepo = extractOwnerRepo(skill.github_url);
  if (!ownerRepo) {
    return skill;
  }

  const repo = await fetchRepoMetadata(ownerRepo, skill);
  if (!repo) {
    return skill;
  }

  const version = await resolveVersion(ownerRepo, skill.version);

  return {
    ...skill,
    version,
    stars: repo.stars,
    updated_at: repo.updated_at,
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
