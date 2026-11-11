import { useState } from "react";
import { Film } from "lucide-react";
import { cn } from "@/utils/utils";

export function ProductGallery({
  imageUrls,
  videoUrl,
  mainIndex,
  onSelect,
  className,
}: {
  imageUrls: string[];
  videoUrl?: string | null;
  mainIndex: number;
  onSelect?: (index: number) => void;
  className?: string;
}) {
  const [showVideo, setShowVideo] = useState(false);
  const imgs = imageUrls ?? [];
  const safe = imgs.length
    ? Math.min(Math.max(0, mainIndex || 0), imgs.length - 1)
    : 0;
  const main = imgs[safe];

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="border-border/60 bg-muted/20 aspect-square w-full overflow-hidden rounded-xl border relative">
        {showVideo && videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            playsInline
            className="h-full w-full object-contain bg-black"
          />
        ) : main ? (
          <img src={main} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      {imgs.length > 1 || videoUrl ? (
        <div className="grid grid-cols-5 gap-3">
          {videoUrl && (
            <button
              type="button"
              onClick={() => setShowVideo(true)}
              className={cn(
                "border-border/60 aspect-square overflow-hidden rounded-xl border bg-gray-900 flex flex-col items-center justify-center transition cursor-pointer",
                showVideo && "border-primary ring-2 ring-primary/20",
              )}
              aria-label="Select video"
            >
              <Film className="size-5 text-white mb-0.5" />
              <span className="text-[9px] text-white font-medium">Video</span>
            </button>
          )}
          {imgs.slice(0, 10).map((u, i) => {
            const isActive = !showVideo && i === safe;
            return (
              <button
                type="button"
                key={`${u}-${i}`}
                className={cn(
                  "border-border/60 aspect-square overflow-hidden rounded-xl border bg-black/5 transition cursor-pointer",
                  isActive && "border-primary ring-2 ring-primary/20",
                )}
                onClick={() => {
                  setShowVideo(false);
                  onSelect?.(i);
                }}
                aria-label="Select image"
              >
                <img src={u} alt="" className="h-full w-full object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
