import { getEnrichedSkills } from "@/lib/api";
import { SkillsClient } from "@/components/SkillsClient";

export default async function Home() {
  const skills = await getEnrichedSkills();

  return (
    <div className="min-h-screen bg-background">
      <SkillsClient initialSkills={skills} />
    </div>
  );
}
