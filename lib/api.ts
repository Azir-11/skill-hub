import skillsData from "@/data/skills.json";

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: "Prompt" | "UI-UX" | "CLI" | "Agent" | "Script";
  github_url: string;
  version: string;
  tags: string[];
}

export interface EnrichedSkill extends Skill {
  stars: number;
  updated_at: string;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  if (diffMonths > 0)
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffMinutes > 0)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  return "just now";
}

function extractOwnerRepo(githubUrl: string): string | null {
  try {
    const url = new URL(githubUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchGitHubStats(
  ownerRepo: string
): Promise<{ stars: number; updated_at: string }> {
  const defaultValues = { stars: 0, updated_at: "recently" };

  try {
    const response = await fetch(
      `https://api.github.com/repos/${ownerRepo}`,
      {
        next: { revalidate: 3600 },
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      return defaultValues;
    }

    const data = await response.json();
    return {
      stars: data.stargazers_count ?? 0,
      updated_at: data.updated_at
        ? formatRelativeTime(data.updated_at)
        : "recently",
    };
  } catch {
    return defaultValues;
  }
}

export async function getEnrichedSkills(): Promise<EnrichedSkill[]> {
  const skills = skillsData as Skill[];

  const enrichedSkills = await Promise.all(
    skills.map(async (skill) => {
      const ownerRepo = extractOwnerRepo(skill.github_url);

      if (!ownerRepo) {
        return {
          ...skill,
          stars: 0,
          updated_at: "recently",
        };
      }

      const { stars, updated_at } = await fetchGitHubStats(ownerRepo);

      return {
        ...skill,
        stars,
        updated_at,
      };
    })
  );

  return enrichedSkills;
}
