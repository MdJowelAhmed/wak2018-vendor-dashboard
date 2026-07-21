import { useMemo, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import {
  SERVICE_COUNTRIES,
  serviceCountryLabel,
} from "@/utils/service-countries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/utils";

const ALL_VALUE = "__ALL_COUNTRIES__";

export type ServiceCountrySelection = {
  /** Single: one country or all. Multi: many countries or all. */
  mode: "single" | "multi";
  /** When true, service is available globally; `countryCodes` is ignored for persistence. */
  allCountries: boolean;
  countryCodes: string[];
};

type CountryMultiSelectProps = {
  id?: string;
  value: ServiceCountrySelection;
  onChange: (next: ServiceCountrySelection) => void;
  error?: string;
  disabled?: boolean;
};

function triggerLabel(v: ServiceCountrySelection): string {
  if (v.allCountries) return "All countries";
  if (v.countryCodes.length === 0) return "Select countries";
  if (v.countryCodes.length === 1)
    return serviceCountryLabel(v.countryCodes[0]!);
  return `${v.countryCodes.length} countries selected`;
}

export function CountryMultiSelect({
  id,
  value,
  onChange,
  error,
  disabled,
}: CountryMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...SERVICE_COUNTRIES];
    return SERVICE_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [query]);

  function setMode(mode: "single" | "multi") {
    if (mode === value.mode) return;
    if (mode === "single") {
      const codes = value.allCountries ? [] : value.countryCodes.slice(0, 1);
      onChange({
        ...value,
        mode: "single",
        allCountries: false,
        countryCodes: codes,
      });
    } else {
      onChange({
        ...value,
        mode: "multi",
        allCountries: value.allCountries,
        countryCodes: value.allCountries ? [] : [...value.countryCodes],
      });
    }
  }

  function removeCode(code: string) {
    if (value.allCountries) return;
    onChange({
      ...value,
      countryCodes: value.countryCodes.filter((c) => c !== code),
    });
  }

  function clearAll() {
    onChange({ ...value, allCountries: false, countryCodes: [] });
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-medium leading-none">Selection mode</span>
        <div className="inline-flex rounded-lg border border-border/60 p-0.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setMode("single")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              value.mode === "single"
                ? "bg-[#895129] text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Single
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setMode("multi")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              value.mode === "multi"
                ? "bg-[#895129] text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Multi
          </button>
        </div>
      </div>

      <DropdownMenu
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setQuery("");
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-expanded={open}
            className={cn(
              "h-10 w-full justify-between font-normal",
              error && "border-red-500",
              !error && "border-input",
            )}
          >
            <span
              className={cn(
                "truncate",
                !value.allCountries &&
                  value.countryCodes.length === 0 &&
                  "text-muted-foreground",
              )}
            >
              {triggerLabel(value)}
            </span>
            <ChevronDown className="size-4 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="z-50 w-[min(100vw-2rem,22rem)] max-h-[min(24rem,calc(100vh-8rem))] overflow-hidden p-0"
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="border-b border-border/60 p-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search countries…"
              className="h-9"
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {value.mode === "single" ? (
              <DropdownMenuRadioGroup
                value={
                  value.allCountries ? ALL_VALUE : (value.countryCodes[0] ?? "")
                }
                onValueChange={(v) => {
                  if (v === ALL_VALUE) {
                    onChange({
                      ...value,
                      allCountries: true,
                      countryCodes: [],
                    });
                  } else if (v) {
                    onChange({
                      ...value,
                      allCountries: false,
                      countryCodes: [v],
                    });
                  }
                  setOpen(false);
                }}
              >
                <DropdownMenuRadioItem
                  value={ALL_VALUE}
                  className="font-medium"
                >
                  All countries
                </DropdownMenuRadioItem>
                {filtered.map((c) => (
                  <DropdownMenuRadioItem key={c.code} value={c.code}>
                    {c.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            ) : (
              <>
                <DropdownMenuCheckboxItem
                  checked={value.allCountries}
                  onCheckedChange={(checked) => {
                    const on = Boolean(checked);
                    onChange({
                      ...value,
                      allCountries: on,
                      countryCodes: on ? [] : value.countryCodes,
                    });
                  }}
                  onSelect={(e) => e.preventDefault()}
                  className="font-medium"
                >
                  Select all countries
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator className="my-1" />
                {filtered.map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.code}
                    checked={
                      !value.allCountries && value.countryCodes.includes(c.code)
                    }
                    disabled={value.allCountries}
                    onCheckedChange={(checked) => {
                      if (value.allCountries) return;
                      const on = Boolean(checked);
                      const next = on
                        ? [...value.countryCodes, c.code]
                        : value.countryCodes.filter((x) => x !== c.code);
                      onChange({
                        ...value,
                        allCountries: false,
                        countryCodes: next,
                      });
                    }}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {c.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </>
            )}
            {filtered.length === 0 ? (
              <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                No matches.
              </p>
            ) : null}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex min-h-[28px] flex-wrap gap-2">
        {value.allCountries ? (
          <Badge
            variant="secondary"
            className="gap-1 border-[#895129]/25 bg-[#895129]/10 pl-2 pr-1 text-[#895129] hover:bg-[#895129]/15"
          >
            All countries
            <button
              type="button"
              className="rounded p-0.5 hover:bg-[#895129]/20"
              aria-label="Remove all countries selection"
              disabled={disabled}
              onClick={() =>
                onChange({ ...value, allCountries: false, countryCodes: [] })
              }
            >
              <X className="size-3" />
            </button>
          </Badge>
        ) : value.countryCodes.length ? (
          value.countryCodes.map((code) => (
            <Badge key={code} variant="secondary" className="gap-1 pl-2 pr-1">
              {serviceCountryLabel(code)}
              <button
                type="button"
                className="text-muted-foreground rounded p-0.5 hover:bg-muted hover:text-foreground"
                aria-label={`Remove ${serviceCountryLabel(code)}`}
                disabled={disabled}
                onClick={() => removeCode(code)}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-xs">
            No countries selected yet.
          </span>
        )}
      </div>

      {value.countryCodes.length > 1 && !value.allCountries ? (
        <button
          type="button"
          className="text-muted-foreground w-fit text-xs underline-offset-2 hover:text-foreground hover:underline"
          disabled={disabled}
          onClick={clearAll}
        >
          Clear all
        </button>
      ) : null}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

export function isCountrySelectionValid(v: ServiceCountrySelection): boolean {
  return v.allCountries || v.countryCodes.length > 0;
}
