import { cn } from "@/utils/utils";

export function ProductGallery({
  imageUrls,
  mainIndex,
  onSelect,
  className,
}: {
  imageUrls: string[];
  mainIndex: number;
  onSelect?: (index: number) => void;
  className?: string;
}) {
  const imgs = imageUrls ?? [];
  const safe = imgs.length
    ? Math.min(Math.max(0, mainIndex || 0), imgs.length - 1)
    : 0;
  const main = imgs[safe];

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="border-border/60 bg-muted/20 aspect-square w-full overflow-hidden rounded-xl border">
        {main ? (
          <img src={main} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      {imgs.length > 1 ? (
        <div className="grid grid-cols-5 gap-3">
          {imgs.slice(0, 10).map((u, i) => {
            const isActive = i === safe;
            return (
              <button
                type="button"
                key={`${u}-${i}`}
                className={cn(
                  "border-border/60 aspect-square overflow-hidden rounded-xl border bg-black/5 transition",
                  isActive && "border-primary ring-2 ring-primary/20",
                )}
                onClick={() => onSelect?.(i)}
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
