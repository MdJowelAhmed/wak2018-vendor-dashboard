import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/utils";

export function DynamicListInput({
  title,
  addLabel,
  value,
  onChange,
  placeholder,
  className,
}: {
  title: string;
  addLabel: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const items = value ?? [];

  function add() {
    onChange([...items, ""]);
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function patch(i: number, next: string) {
    onChange(items.map((v, idx) => (idx === i ? next : v)));
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <Button type="button" size="sm" variant="secondary" onClick={add}>
          + {addLabel}
        </Button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Add items to show on your service details page.
          </p>
        ) : (
          items.map((v, i) => (
            <div
              key={i}
              className="bg-muted/30 border-border/60 grid grid-cols-1 gap-2 rounded-xl border p-3 transition-all duration-200 sm:grid-cols-[1fr_auto]"
            >
              <Input
                value={v}
                onChange={(e) => patch(i, e.target.value)}
                placeholder={placeholder}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(i)}
                aria-label="Remove item"
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
