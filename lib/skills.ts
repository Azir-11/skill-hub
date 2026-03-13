import skillsData from "@/data/skills.json";

export const CATEGORY_OPTIONS = ["All", "Prompt", "UI-UX", "CLI", "Agent", "Script"] as const;

export type Category = (typeof CATEGORY_OPTIONS)[number];
export type SkillCategory = Exclude<Category, "All">;

export interface Skill {
  id: string;
  name: string;
  description: string;
  full_description: string;
  category: SkillCategory;
  github_url: string;
  version: string | null;
  stars: number | null;
  updated_at: string | null;
  recommendation_score: number;
  tags: string[];
}

export interface EnrichedSkill extends Skill {
  updated_at_label: string;
  stars_label: string;
}

export const skills = skillsData as Skill[];

export const SELF_REPO_BASE_URL = "https://github.com/Azir-11/skill-hub/tree/main/data/skills";

export const isSelfSkill = (skill: Pick<Skill, "github_url">) => skill.github_url === "self";

export const findSelfSkillByName = (name: string) =>
  skills.find((skill) => skill.name === name && isSelfSkill(skill));

export const getSelfSkillRepoUrl = (name: string) => `${SELF_REPO_BASE_URL}/${name}`;

export const getSkillHref = (skill: Skill) => (isSelfSkill(skill) ? `/skills/${skill.name}` : skill.github_url);

export const categoryLabels: Record<Category, string> = {
  All: "全部",
  Prompt: "提示词",
  "UI-UX": "界面设计",
  CLI: "命令行",
  Agent: "智能体",
  Script: "框架脚本",
};

export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) {
    return "待同步";
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "待同步";
  }

  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears} 年前更新`;
  if (diffMonths > 0) return `${diffMonths} 个月前更新`;
  if (diffDays > 0) return `${diffDays} 天前更新`;
  if (diffHours > 0) return `${diffHours} 小时前更新`;
  if (diffMinutes > 0) return `${diffMinutes} 分钟前更新`;
  return "刚刚更新";
}

export function formatStars(count: number | null): string {
  if (count === null || Number.isNaN(count)) {
    return "待同步";
  }

  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)} 万`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }

  return count.toString();
}
