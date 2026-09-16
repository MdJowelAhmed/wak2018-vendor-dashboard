import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/utils";

export type SearchableOption = {
  value: string;
  label: string;
  keywords?: string;
};

export function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  disabled,
  emptyText = "No results",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? options.filter((o) =>
          `${o.label} ${o.keywords ?? ""}`.toLowerCase().includes(q),
        )
      : options;
    return list.slice(0, 150);
  }, [options, query]);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-between font-normal",
            !selected && "text-muted-foreground",
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="z-50 w-[var(--radix-dropdown-menu-trigger-width)] min-w-[16rem] max-h-[min(24rem,calc(100vh-8rem))] overflow-hidden p-0"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b border-border/60 p-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9"
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {filtered.length ? (
            filtered.map((o) => (
              <DropdownMenuItem
                key={o.value}
                onSelect={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className="flex items-center justify-between gap-2"
              >
                <span className="truncate">{o.label}</span>
                {o.value === value ? (
                  <Check className="size-4 shrink-0 text-[#895129]" />
                ) : null}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          )}
          {options.length > filtered.length ? (
            <div className="px-2 py-2 text-center text-xs text-muted-foreground">
              Type to see more results
            </div>
          ) : null}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
