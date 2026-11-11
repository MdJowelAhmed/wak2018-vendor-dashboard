import React, { useId, useMemo, useRef, useState } from "react";
import { Film, Trash2, UploadCloud, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";
import { toast } from "sonner";

export type VideoUploaderValue = {
  file: File | null;
  existingUrl?: string | null;
  removeVideo?: boolean;
};

export interface VideoUploaderProps {
  value: VideoUploaderValue;
  onChange: (next: VideoUploaderValue) => void;
  maxSizeMB?: number; // default 100
  title?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

const ALLOWED_EXTENSIONS = [".mp4", ".webm", ".mov", ".mkv"];
const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
];

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function VideoUploader({
  value,
  onChange,
  maxSizeMB = 100,
  title = "Promotional Video",
  description = "Upload a video (MP4, WebM, MOV, or MKV up to 100MB). Optional.",
  className,
  disabled = false,
}: VideoUploaderProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // If removeVideo is true, treat as no video present
  const hasVideo = Boolean(
    value.file || (!value.removeVideo && value.existingUrl),
  );

  const previewUrl = useMemo(() => {
    if (value.file) {
      return URL.createObjectURL(value.file);
    }
    if (!value.removeVideo && value.existingUrl) {
      return value.existingUrl;
    }
    return null;
  }, [value.file, value.existingUrl, value.removeVideo]);

  // Clean up object URL when value.file changes or unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl && value.file) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, value.file]);

  function validateFile(file: File): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(
        `Video size exceeds the ${maxSizeMB}MB limit (${formatBytes(file.size)}).`,
      );
      return false;
    }

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const isExtensionValid = ALLOWED_EXTENSIONS.includes(ext);
    const isMimeValid =
      !file.type ||
      ALLOWED_MIME_TYPES.includes(file.type) ||
      file.type.startsWith("video/");

    if (!isExtensionValid && !isMimeValid) {
      toast.error(
        `Unsupported file format. Please upload an MP4, WebM, MOV, or MKV video.`,
      );
      return false;
    }

    return true;
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || disabled) return;
    const file = files[0];
    if (validateFile(file)) {
      onChange({
        file,
        existingUrl: value.existingUrl,
        removeVideo: false,
      });
      toast.success(`Selected video: ${file.name}`);
    }
  }

  function handleRemove() {
    if (disabled) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onChange({
      file: null,
      existingUrl: null,
      removeVideo: Boolean(value.existingUrl || value.file),
    });
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
            <span className="text-muted-foreground text-xs font-normal">
              (Optional · Max {maxSizeMB}MB)
            </span>
          </div>
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>

        {hasVideo ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer text-xs"
            >
              <Film className="mr-1.5 size-3.5" />
              Replace
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={disabled}
              onClick={handleRemove}
              className="text-xs"
            >
              <Trash2 className="mr-1.5 size-3.5" />
              Remove
            </Button>
          </div>
        ) : (
          <Button
            asChild
            variant="secondary"
            size="sm"
            disabled={disabled}
            className="cursor-pointer"
          >
            <label htmlFor={inputId}>
              <Video className="mr-1.5 size-4" />
              Upload Video
            </label>
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov,.mkv"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {hasVideo && previewUrl ? (
        <div className="space-y-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/70 bg-black/90 shadow-inner">
            <video
              key={previewUrl}
              src={previewUrl}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-contain"
            >
              Your browser does not support HTML5 video streaming.
            </video>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <div className="flex items-center gap-1.5 truncate">
              <Film className="size-3.5 shrink-0 text-primary" />
              <span className="truncate font-medium text-foreground">
                {value.file
                  ? value.file.name
                  : (value.existingUrl?.split("/").pop() ?? "Existing video")}
              </span>
              {value.file && (
                <span className="shrink-0 text-muted-foreground">
                  ({formatBytes(value.file.size)})
                </span>
              )}
            </div>
            {value.file && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                New Upload
              </span>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={cn(
            "border-border/60 bg-muted/10 hover:bg-muted/30 cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all",
            isDragging && "border-primary bg-primary/5 ring-2 ring-primary/20",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <div className="space-y-2">
            <div className="bg-primary/10 text-primary mx-auto flex size-10 items-center justify-center rounded-lg">
              <UploadCloud className="size-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">
                Drag and drop video here, or click to browse
              </p>
              <p className="text-muted-foreground text-xs">
                Supports MP4, WebM, MOV, or MKV up to 100MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
