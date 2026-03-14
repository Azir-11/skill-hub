import Link from "next/link";
import { Star, Clock, Tag, Sparkles, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EnrichedSkill } from "@/lib/api";
import { getSkillHref, isSelfSkill } from "@/lib/skills";

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

function getSourceLabel(isOfficial: boolean): string {
  return isOfficial ? "本站提供" : "社区收录";
}

function getSourceDetail(skill: EnrichedSkill, isOfficial: boolean): string {
  if (isOfficial) {
    return `skills/${skill.name}`;
  }

  try {
    const { hostname } = new URL(skill.github_url);
    return hostname.replace(/^www\./, "");
  } catch {
    return "外部仓库";
  }
}

interface SkillCardProps {
  skill: EnrichedSkill;
}

export function SkillCard({ skill }: SkillCardProps) {
  const href = getSkillHref(skill);
  const isOfficial = isSelfSkill(skill);
  const detailText = skill.full_description || skill.description;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block h-full cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
    >
      <Card
        className={`relative flex h-full flex-col overflow-hidden border border-white/10 bg-white/4.5 backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-250 group-hover:border-white/18 group-hover:bg-white/6 group-hover:shadow-xl group-hover:shadow-black/15 ${isOfficial
          ? "border-cyan-400/20 bg-linear-to-br from-cyan-500/10 via-white/4.5 to-emerald-500/10 shadow-lg shadow-cyan-950/20"
          : ""
          }`}
      >
        <CardContent className="flex flex-1 flex-col p-6">
          <div className="flex items-center justify-between gap-4">
            <Badge variant={getCategoryVariant(skill.category)}>
              {CATEGORY_LABELS[skill.category] ?? skill.category}
            </Badge>
            <span className="text-xs font-mono text-muted-foreground/70">{skill.version}</span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-[11px]">
            <span
              className={
                isOfficial
                  ? "inline-flex items-center gap-1.5 text-cyan-200/85"
                  : "inline-flex items-center gap-1.5 text-muted-foreground/72"
              }
            >
              {isOfficial && <Sparkles className="h-3 w-3" />}
              {getSourceLabel(isOfficial)}
            </span>
            <span
              className={
                isOfficial
                  ? "font-mono text-cyan-100/75"
                  : "font-mono text-muted-foreground/65"
              }
            >
              {getSourceDetail(skill, isOfficial)}
            </span>
          </div>

          <h3 className="mt-5 text-[1.95rem] leading-none font-semibold tracking-[-0.035em] text-foreground sm:text-[2.1rem]">
            {skill.name}
          </h3>

          <p className="mt-4 min-h-13 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {skill.description}
          </p>

          {skill.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {skill.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md border border-white/8 bg-white/5 px-2 py-1 text-xs text-muted-foreground/80"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="px-6 pb-5 pt-0">
          <div className="flex w-full items-center justify-between gap-4 border-t border-white/6 pt-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground/80">{formatStars(skill.stars)}</span>
              <span className="text-muted-foreground/60">星标</span>
            </span>
            {isOfficial ? (
              <span className="flex items-center gap-1.5 text-cyan-200/90">
                <ArrowUpRight className="h-3.5 w-3.5" />
                查看仓库目录
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {skill.updated_at}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>

      <div className="pointer-events-none absolute inset-x-5 top-full z-30 mt-3 origin-top rounded-2xl border border-white/10 bg-black/88 px-4 py-3 opacity-0 shadow-2xl shadow-black/35 backdrop-blur-md transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 translate-y-1">
        <p className="text-sm leading-6 text-slate-100">{detailText}</p>
      </div>
    </Link>
  );
}
