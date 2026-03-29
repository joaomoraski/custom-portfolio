"use client";
import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { TechBadge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { formatDate } from "@/lib/utils";
import { Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExperienceCardProps {
  id: string;
  title: string;
  company: string;
  description: string;
  techStack: string[];
  startDate: Date | string;
  endDate: Date | string | null;
  isCurrent: boolean;
}

export function ExperienceCard({
  title,
  company,
  description,
  techStack,
  startDate,
  endDate,
  isCurrent,
}: ExperienceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Decide if the description is long enough to warrant a "Show more" button
  // 300 characters is a good threshold for a few lines of markdown
  const isLongDescription = description.length > 300;

  return (
    <div className="relative sm:pl-12 group">
      {/* Timeline marker */}
      <div className="absolute left-0 top-6 hidden sm:flex items-center justify-center w-10 h-10 rounded-full dark:bg-black bg-white border-4 dark:border-[#0a0a0a] border-gray-50 z-10 transition-colors group-hover:dark:border-purple-900/30 group-hover:border-purple-100">
        <div className="w-full h-full rounded-full dark:bg-purple-500/20 bg-purple-100 flex items-center justify-center dark:text-purple-400 text-purple-600">
          <Briefcase size={16} />
        </div>
      </div>

      <GlassCard className="p-6 sm:p-8 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold dark:text-white text-gray-900">{title}</h2>
            <div className="text-lg dark:text-purple-400 text-purple-600 font-medium mt-1">
              {company}
            </div>
          </div>
          <div className="flex-shrink-0 inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium dark:bg-white/5 bg-gray-100 dark:text-white/70 text-gray-600 border dark:border-white/10 border-gray-200">
            {formatDate(startDate)} — {isCurrent ? "Present" : endDate ? formatDate(endDate) : "Unknown"}
          </div>
        </div>

        <div 
          className={cn("relative", isLongDescription && !isExpanded && "cursor-pointer")}
          onClick={() => {
            if (isLongDescription && !isExpanded) setIsExpanded(true);
          }}
        >
          <div className={cn(
            "prose prose-sm sm:prose-base prose-invert dark:prose-invert max-w-none transition-all duration-300",
            !isExpanded && isLongDescription && "line-clamp-4"
          )}>
            <MarkdownRenderer content={description} />
          </div>
          
          {!isExpanded && isLongDescription && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t dark:from-[#0a0a0a] from-white to-transparent pointer-events-none" />
          )}
        </div>

        {isLongDescription && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 flex items-center gap-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            {isExpanded ? (
              <>Show less <ChevronUp size={16} /></>
            ) : (
              <>Show more <ChevronDown size={16} /></>
            )}
          </button>
        )}

        {techStack && techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-6 mt-4 border-t dark:border-white/10 border-gray-100">
            {techStack.map((tech: string) => (
              <TechBadge key={tech} label={tech} />
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
