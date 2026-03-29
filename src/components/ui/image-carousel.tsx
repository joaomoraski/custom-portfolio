"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  imageIds: string[];
  alt?: string;
}

export function ImageCarousel({ imageIds, alt = "Image" }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!imageIds || imageIds.length === 0) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === imageIds.length - 1 ? 0 : prev + 1));
  };
  
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? imageIds.length - 1 : prev - 1));
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 aspect-video flex items-center justify-center group mb-8">
      <img
        src={`/api/media/${imageIds[currentIndex]}`}
        alt={`${alt} ${currentIndex + 1}`}
        className="max-w-full max-h-full object-contain"
      />
      
      {imageIds.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ChevronRight size={24} />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md">
            {imageIds.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentIndex ? "bg-white w-4" : "bg-white/40 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}