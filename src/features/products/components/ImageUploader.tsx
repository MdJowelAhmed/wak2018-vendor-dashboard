import { useMemo } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

export type ImageUploaderValue = {
  existingUrls: string[];
  files: File[];
  mainIndex: number;
};

export function ImageUploader({
  value,
  onChange,
  className,
}: {
  value: ImageUploaderValue;
  onChange: (next: ImageUploaderValue) => void;
  className?: string;
}) {
  const thumbs = useMemo(() => {
    const fileUrls = value.files.map((f) => ({
      kind: "file" as const,
      url: URL.createObjectURL(f),
    }));
    return [
      ...value.existingUrls.map((u) => ({ kind: "existing" as const, url: u })),
      ...fileUrls,
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.existingUrls.join("|"), value.files]);

  const total = thumbs.length;
  const mainIndex = Math.min(
    Math.max(0, value.mainIndex),
    Math.max(0, total - 1),
  );

  function addFiles(list: FileList | null) {
    if (!list) return;
    const added = Array.from(list).filter((f) => f.type.startsWith("image/"));
    onChange({ ...value, files: [...value.files, ...added] });
  }

  function removeAt(i: number) {
    const existingCount = value.existingUrls.length;
    if (i < existingCount) {
      const nextExisting = value.existingUrls.filter((_, idx) => idx !== i);
      const nextMain =
        mainIndex === i ? 0 : mainIndex > i ? mainIndex - 1 : mainIndex;
      onChange({ ...value, existingUrls: nextExisting, mainIndex: nextMain });
      return;
    }
    const fileIndex = i - existingCount;
    const nextFiles = value.files.filter((_, idx) => idx !== fileIndex);
    const nextMain =
      mainIndex === i ? 0 : mainIndex > i ? mainIndex - 1 : mainIndex;
    onChange({ ...value, files: nextFiles, mainIndex: nextMain });
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold tracking-tight">
            Product Images
          </h3>
          <p className="text-muted-foreground text-xs">
            Upload multiple images. Pick a main image.
          </p>
        </div>

        <label className="inline-flex">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <Button type="button" variant="secondary" size="sm">
            <ImagePlus className="mr-2 size-4" />
            Upload
          </Button>
        </label>
      </div>

      {total === 0 ? (
        <div className="border-border/60 bg-muted/20 grid place-items-center rounded-xl border p-8 text-center">
          <div className="space-y-2">
            <div className="bg-primary/10 text-primary mx-auto flex size-10 items-center justify-center rounded-lg">
              <ImagePlus className="size-5" />
            </div>
            <p className="text-sm font-medium">No images yet</p>
            <p className="text-muted-foreground text-sm">
              Upload at least one image for best results.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {thumbs.map((t, i) => {
            const isMain = i === mainIndex;
            return (
              <button
                type="button"
                key={`${t.kind}-${t.url}-${i}`}
                onClick={() => onChange({ ...value, mainIndex: i })}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-xl border bg-black/5 transition",
                  isMain
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border/60 hover:border-border",
                )}
                aria-label={isMain ? "Main image" : "Set as main image"}
              >
                <img
                  src={t.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="absolute left-2 top-2 flex items-center gap-1">
                  {isMain && (
                    <span className="bg-primary text-primary-foreground inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium">
                      <Star className="size-3" />
                      Main
                    </span>
                  )}
                </div>

                <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeAt(i);
                    }}
                    aria-label="Remove image"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
