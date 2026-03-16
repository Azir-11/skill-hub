"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORY_OPTIONS, categoryLabels } from "@/lib/skills";

const CATEGORIES = CATEGORY_OPTIONS;
const TAGS_INITIAL_COUNT = 12;

type Category = (typeof CATEGORIES)[number];

interface HeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

export function Hero({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  allTags,
  selectedTags,
  onTagToggle,
}: HeroProps) {
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const hasMoreTags = allTags.length > TAGS_INITIAL_COUNT;
  const visibleTags = tagsExpanded ? allTags : allTags.slice(0, TAGS_INITIAL_COUNT);
  const hiddenCount = hasMoreTags ? allTags.length - TAGS_INITIAL_COUNT : 0;

  return (
    <section className="relative overflow-hidden py-12 px-4 text-center">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
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
          Curated AI{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-blue-400">
            Primitives.
          </span>
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
            {categoryLabels[category]}
          </Button>
        ))}
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="mx-auto mt-4 max-w-3xl">
          <div className="flex flex-wrap justify-center gap-2">
            {visibleTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagToggle(tag)}
                className={
                  selectedTags.includes(tag)
                    ? "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border border-violet-500 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-colors"
                    : "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                }
              >
                {tag}
                {selectedTags.includes(tag) && <X className="h-3 w-3" />}
              </button>
            ))}
          </div>

          {hasMoreTags && (
            <button
              type="button"
              onClick={() => setTagsExpanded((v) => !v)}
              className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {tagsExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  收起
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  {`展开更多标签 (${hiddenCount})`}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
