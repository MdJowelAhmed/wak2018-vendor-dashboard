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
import {
  setPreferredCurrency,
  useCurrency,
} from "./currencyStore";

const POPULAR = [
  "USD",
  "EUR",
  "GBP",
  "BDT",
  "INR",
  "AED",
  "SAR",
  "CAD",
  "AUD",
  "JPY",
  "CNY",
  "MYR",
  "SGD",
  "PKR",
];

function currencyLabel(code: string) {
  try {
    return new Intl.DisplayNames(undefined, { type: "currency" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function CurrencySelect() {
  const { currency, rates } = useCurrency();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const codes = Object.keys(rates).filter((code) => /^[A-Z]{3}$/.test(code));
    const popular = POPULAR.filter((code) => codes.includes(code));
    const rest = codes
      .filter((code) => !popular.includes(code))
      .sort((a, b) => a.localeCompare(b));
    return [...popular, ...rest];
  }, [rates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((code) => {
      const name = currencyLabel(code).toLowerCase();
      return code.toLowerCase().includes(q) || name.includes(q);
    });
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
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-full border-gray-200 bg-white px-3 text-xs font-semibold"
        >
          {currency}
          <ChevronDown className="ml-1 size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-50 w-64 overflow-hidden p-0"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b border-border/60 p-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search currency…"
            className="h-8"
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {filtered.length ? (
            filtered.map((code) => (
              <DropdownMenuItem
                key={code}
                className="flex items-center justify-between gap-2"
                onSelect={() => {
                  setPreferredCurrency(code);
                  setOpen(false);
                }}
              >
                <span className="min-w-0">
                  <span className="font-semibold">{code}</span>
                  <span className="ml-2 truncate text-xs text-muted-foreground">
                    {currencyLabel(code)}
                  </span>
                </span>
                {code === currency ? (
                  <Check className={cn("size-4 shrink-0 text-[#895129]")} />
                ) : null}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No currencies found
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
