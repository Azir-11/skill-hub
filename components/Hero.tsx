"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Prompt", "UI-UX", "CLI", "Agent", "Script"] as const;
const CATEGORY_LABELS: Record<Category, string> = {
  All: "全部",
  Prompt: "提示词",
  "UI-UX": "界面设计",
  CLI: "命令行",
  Agent: "智能体",
  Script: "脚本",
};

type Category = (typeof CATEGORIES)[number];

interface HeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export function Hero({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden py-12 px-4 text-center">
      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-150 w-225 rounded-full bg-linear-to-b from-violet-600/20 via-blue-600/10 to-transparent blur-3xl" />
      </div>

      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
        <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
        AI Skill Hub
      </div>

      {/* Headline */}
      <div className="relative flex flex-col items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-25 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none"></div>

        {/* 主标题文字 */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white relative z-10">
          Curated AI <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-blue-400">Primitives.</span>

        </h1>
      </div>

      {/* Sub-headline */}
      <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground mt-4">
        聚合高质量的 AI 工具链与底层逻辑，专注于最核心的代码与提示词
      </p>

      {/* Search input */}
      <div className="mx-auto mb-8 flex max-w-xl items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 shadow-lg backdrop-blur-sm focus-within:border-violet-500/50 focus-within:bg-white/8 transition-all duration-300">
        <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Yep,it is a search box"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className={
              activeCategory === category
                ? "bg-violet-600 text-white hover:bg-violet-700 border-transparent"
                : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground backdrop-blur-sm"
            }
          >
            {CATEGORY_LABELS[category]}
          </Button>
        ))}
      </div>
    </section>
  );
}
