import Link from "next/link";
import { Star, Clock, Tag } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EnrichedSkill } from "@/lib/api";

type CategoryVariant = "prompt" | "ui-ux" | "cli" | "agent" | "script";
const CATEGORY_LABELS: Record<string, string> = {
  Prompt: "提示词",
  "UI-UX": "界面设计",
  CLI: "命令行",
  Agent: "智能体",
  Script: "脚本",
};

function getCategoryVariant(category: string): CategoryVariant {
  const map: Record<string, CategoryVariant> = {
    Prompt: "prompt",
    "UI-UX": "ui-ux",
    CLI: "cli",
    Agent: "agent",
    Script: "script",
  };
  return map[category] ?? "prompt";
}

function formatStars(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

interface SkillCardProps {
  skill: EnrichedSkill;
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Link
      href={skill.github_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-xl"
    >
      <Card className="h-full border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-violet-500/40 group-hover:bg-white/8 group-hover:shadow-xl group-hover:shadow-violet-500/10">
        <CardContent className="flex flex-col gap-3 p-6">
          {/* Top: Category badge + Version */}
          <div className="flex items-center justify-between">
            <Badge variant={getCategoryVariant(skill.category)}>
              {CATEGORY_LABELS[skill.category] ?? skill.category}
            </Badge>
            <span className="text-xs font-mono text-muted-foreground/70">
              {skill.version}
            </span>
          </div>

          {/* Name */}
          <h3 className="text-lg font-semibold text-foreground leading-tight group-hover:text-violet-300 transition-colors duration-200">
            {skill.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {skill.description}
          </p>

          {/* Tags */}
          {skill.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {skill.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted-foreground/80 border border-white/8"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        {/* Footer: Stars + Last updated */}
        <CardFooter className="px-6 pb-5 pt-0">
          <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground/80">
                {formatStars(skill.stars)}
              </span>
              <span className="text-muted-foreground/60">星标</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {skill.updated_at}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
