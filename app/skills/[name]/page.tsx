import { notFound, permanentRedirect } from "next/navigation";
import { findSelfSkillByName, getSelfSkillRepoUrl } from "@/lib/skills";

interface SkillRedirectPageProps {
  params: Promise<{
    name: string;
  }>;
}

export default async function SkillRedirectPage({ params }: SkillRedirectPageProps) {
  const { name } = await params;
  const skill = findSelfSkillByName(name);

  if (!skill) {
    notFound();
  }

  permanentRedirect(getSelfSkillRepoUrl(skill.name));
}
