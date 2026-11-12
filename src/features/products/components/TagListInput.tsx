import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/utils";

export function TagListInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  addLabel = "Add",
  className,
}: {
  id: string;
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState("");
  const items = value ?? [];

  function addItem() {
    const next = draft.trim();
    if (!next) return;
    const exists = items.some((item) => item.toLowerCase() === next.toLowerCase());
    if (!exists) onChange([...items, next]);
    setDraft("");
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Label className="text-gray-700" htmlFor={id}>
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className="rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#895129]"
        />
        <Button
          type="button"
          variant="secondary"
          className="shrink-0 rounded-lg"
          onClick={addItem}
        >
          {addLabel}
        </Button>
      </div>
      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-800"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-muted-foreground hover:text-foreground rounded-full p-0.5"
                aria-label={`Remove ${item}`}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">
          Type a value and click Add.
        </p>
      )}
    </div>
  );
}
