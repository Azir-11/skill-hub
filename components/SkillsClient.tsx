"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { SkillCard } from "@/components/SkillCard";
import { Button } from "@/components/ui/button";
import type { EnrichedSkill } from "@/lib/api";

const ITEMS_PER_PAGE = 12;

type Category = "All" | "Prompt" | "UI-UX" | "CLI" | "Agent" | "Script";

interface SkillsClientProps {
  initialSkills: EnrichedSkill[];
}

export function SkillsClient({ initialSkills }: SkillsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSkills = useMemo(() => {
    let result = initialSkills;

    if (activeCategory !== "All") {
      result = result.filter((s) => s.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [initialSkills, activeCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredSkills.length / ITEMS_PER_PAGE));

  const paginatedSkills = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSkills.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSkills, currentPage]);

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  function handleCategoryChange(category: Category) {
    setActiveCategory(category);
    setCurrentPage(1);
  }

  return (
    <>
      <Hero
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Results count */}
        <div className="mb-6 flex items-center justify-end">
          <p className="text-sm text-muted-foreground">
            {filteredSkills.length === 0
              ? "未找到技能"
              : `${filteredSkills.length} 个 Skill`}
          </p>
          {totalPages > 1 && (
            <p className="text-sm text-muted-foreground">
              第 {currentPage} / {totalPages} 页
            </p>
          )}
        </div>

        {/* Grid */}
        {filteredSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-5xl">🔍</div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              未找到技能
            </h3>
            <p className="text-muted-foreground">
              请尝试调整搜索词或分类条件。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-30"
              aria-label="上一页"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={
                  currentPage === page
                    ? "bg-violet-600 text-white hover:bg-violet-700 border-transparent min-w-[36px]"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground min-w-[36px]"
                }
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-30"
              aria-label="下一页"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
