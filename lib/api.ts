import { formatRelativeTime, skills, type Skill } from "@/lib/skills";

export interface EnrichedSkill extends Skill {
  stars: number;
  updated_at: string;
}

export async function getEnrichedSkills(): Promise<EnrichedSkill[]> {
  return [...skills]
    .sort((left, right) => {
      if (right.recommendation_score !== left.recommendation_score) {
        return right.recommendation_score - left.recommendation_score;
      }

      const rightStars = right.stars ?? -1;
      const leftStars = left.stars ?? -1;
      if (rightStars !== leftStars) {
        return rightStars - leftStars;
      }

      return left.name.localeCompare(right.name, "zh-CN");
    })
    .map((skill) => ({
      ...skill,
      stars: skill.stars ?? 0,
      updated_at: formatRelativeTime(skill.updated_at),
      version: skill.version ?? "unknown",
    }));
}
