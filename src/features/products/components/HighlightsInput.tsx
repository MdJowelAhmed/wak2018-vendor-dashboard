import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/utils";

export type HighlightRow = { title: string; value: string };

export function HighlightsInput({
  value,
  onChange,
  className,
}: {
  value: HighlightRow[];
  onChange: (next: HighlightRow[]) => void;
  className?: string;
}) {
  const rows = value ?? [];

  function addRow() {
    onChange([...rows, { title: "", value: "" }]);
  }

  function removeRow(i: number) {
    const next = rows.filter((_, idx) => idx !== i);
    onChange(next);
  }

  function patch(i: number, next: Partial<HighlightRow>) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...next } : r)));
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight">Top Highlights</h3>
        <Button type="button" size="sm" variant="secondary" onClick={addRow}>
          + Add Highlight
        </Button>
      </div>

      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Add key details like Color → Green or Material → Leather.
          </p>
        ) : (
          rows.map((r, i) => (
            <div
              key={i}
              className="bg-muted/30 border-border/60 grid grid-cols-1 gap-2 rounded-xl border p-3 transition-all duration-200 sm:grid-cols-[1fr_1fr_auto]"
            >
              <Input
                placeholder="Title (e.g. Color)"
                value={r.title}
                onChange={(e) => patch(i, { title: e.target.value })}
              />
              <Input
                placeholder="Value (e.g. Green)"
                value={r.value}
                onChange={(e) => patch(i, { value: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRow(i)}
                aria-label="Remove highlight"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
