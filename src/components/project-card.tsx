"use client";

import Link from "next/link";
import { Code2, ExternalLink, ChevronLeft, ChevronRight, X } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { TechBadge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  imageIds: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
}

export function ProjectCard({
  title,
  description,
  techStack,
  imageIds,
  githubUrl,
  liveUrl,
}: ProjectCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const mainImageId = imageIds[0];
  
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === imageIds.length - 1 ? 0 : prev + 1));
  };
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? imageIds.length - 1 : prev - 1));
  };
  
  // Create truncated description for the card view
  const isLongDescription = description.length > 150;
  const shortDescription = isLongDescription ? `${description.slice(0, 150)}...` : description;

  return (
    <>
      {/* Project Card */}
      <GlassCard hover className="overflow-hidden flex flex-col h-[480px]">
        <div 
          className="cursor-pointer flex flex-col h-full"
          onClick={() => setIsModalOpen(true)}
        >
          {mainImageId ? (
            <div className="h-56 shrink-0 overflow-hidden relative group">
              <img
                src={`/api/media/${mainImageId}`}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {imageIds.length > 1 && (
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-medium">
                  1 / {imageIds.length}
                </div>
              )}
            </div>
          ) : (
            <div className="h-56 shrink-0 dark:bg-gradient-to-br dark:from-purple-950/50 dark:to-blue-950/50 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
              <span className="text-4xl dark:text-white/10 text-gray-200 font-bold">{title[0]}</span>
            </div>
          )}

          <div className="p-5 flex flex-col flex-1 gap-3 relative">
            <h3 className="font-semibold text-lg dark:text-white text-gray-900 line-clamp-1">{title}</h3>
            
            <div className="text-sm dark:text-white/60 text-gray-600 flex-1 relative">
              <div className="prose prose-sm prose-invert dark:prose-invert max-w-none line-clamp-3">
                <MarkdownRenderer content={shortDescription} />
              </div>
              {isLongDescription && (
                <span className="text-purple-500 dark:text-purple-400 font-medium text-xs mt-1 inline-block hover:underline">
                  Show more
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-auto">
              {techStack.slice(0, 4).map((tech) => (
                <TechBadge key={tech} label={tech} />
              ))}
              {techStack.length > 4 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium dark:bg-white/5 bg-gray-100 dark:text-white/50 text-gray-500 border dark:border-white/10 border-gray-200">
                  +{techStack.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div 
            className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl border dark:border-white/10 border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b dark:border-white/10 border-gray-100">
              <h2 className="text-xl font-bold dark:text-white text-gray-900">{title}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full dark:hover:bg-white/10 hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="dark:text-white/70 text-gray-500" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8">
              {/* Carousel */}
              {imageIds.length > 0 && (
                <div className="relative rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 aspect-video flex items-center justify-center group">
                  <img
                    src={`/api/media/${imageIds[currentImageIndex]}`}
                    alt={`${title} - Image ${currentImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                  
                  {imageIds.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <ChevronRight size={24} />
                      </button>
                      
                      {/* Dots indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md">
                        {imageIds.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              idx === currentImageIndex ? "bg-white w-4" : "bg-white/40 hover:bg-white/70"
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold dark:text-white/60 text-gray-500 mb-3 uppercase tracking-wider">About</h3>
                <div className="prose prose-invert dark:prose-invert max-w-none text-base">
                  <MarkdownRenderer content={description} />
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <h3 className="text-sm font-semibold dark:text-white/60 text-gray-500 mb-3 uppercase tracking-wider">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <TechBadge key={tech} label={tech} />
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer with Links */}
            {(githubUrl || liveUrl) && (
              <div className="p-5 border-t dark:border-white/10 border-gray-100 bg-gray-50 dark:bg-white/5 flex flex-wrap items-center gap-3">
                {liveUrl && (
                  <Link
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all"
                  >
                    <ExternalLink size={16} />
                    Visit Live Demo
                  </Link>
                )}
                {githubUrl && (
                  <Link
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 text-gray-700 dark:text-white/80 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/20 transition-all"
                  >
                    <Code2 size={16} />
                    View Source Code
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
