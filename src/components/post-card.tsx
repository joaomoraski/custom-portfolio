import Link from "next/link";
import { Calendar } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImageId?: string | null;
  createdAt: Date | string;
  basePath: "blog" | "achievements";
}

export function PostCard({ title, slug, excerpt, coverImageId, createdAt, basePath }: PostCardProps) {
  return (
    <Link href={`/${basePath}/${slug}`}>
      <GlassCard hover className="overflow-hidden flex flex-col h-full">
        {coverImageId && (
          <div className="aspect-video overflow-hidden">
            <img
              src={`/api/media/${coverImageId}`}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        <div className="p-5 flex flex-col flex-1 gap-3">
          <h3 className="font-semibold text-lg dark:text-white text-gray-900 line-clamp-2">{title}</h3>
          {excerpt && (
            <p className="text-sm dark:text-white/60 text-gray-600 leading-relaxed flex-1 line-clamp-3">{excerpt}</p>
          )}
          <div className="flex items-center gap-1.5 text-xs dark:text-white/40 text-gray-400 pt-1 border-t dark:border-white/10 border-gray-100">
            <Calendar size={12} />
            {formatDate(createdAt)}
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
