"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Prompt", "UI-UX", "CLI", "Agent", "Script"] as const;

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
    <section className="relative overflow-hidden py-24 px-4 text-center">
      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-b from-violet-600/20 via-blue-600/10 to-transparent blur-3xl" />
      </div>

      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
        <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
        AI-powered skill registry
      </div>

      {/* Headline */}
      <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
        Discover &amp; Manage{" "}
        <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
          AI Skills
        </span>
      </h1>

      {/* Sub-headline */}
      <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
        Browse curated AI skills, scripts, agents, and prompts from the open-source
        community. Find the tools you need to build smarter, faster.
      </p>

      {/* Search input */}
      <div className="mx-auto mb-8 flex max-w-xl items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 shadow-lg backdrop-blur-sm focus-within:border-violet-500/50 focus-within:bg-white/8 transition-all duration-300">
        <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search skills, agents, prompts..."
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
            {category}
          </Button>
        ))}
      </div>
    </section>
  );
}
