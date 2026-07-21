import { cn } from "@/utils/utils";
import type { UserRole } from "../types/authTypes";

type Props = {
  value: UserRole;
  onChange: (r: UserRole) => void;
  disabled?: boolean;
};

export function RoleSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="rounded-xl border border-white/40 bg-white/60 p-1 shadow-sm backdrop-blur">
      <div
        className="grid grid-cols-2 gap-1"
        role="radiogroup"
        aria-label="Account type"
      >
        {(
          [
            { role: "vendor" as const, label: "Vendor" },
            { role: "service" as const, label: "Service Provider" },
          ] satisfies { role: UserRole; label: string }[]
        ).map((o) => {
          const selected = value === o.role;
          return (
            <button
              key={o.role}
              type="button"
              disabled={disabled}
              onClick={() => onChange(o.role)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold",
                "transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#895129]",
                selected
                  ? "border border-[#895129] bg-[#895129] text-white shadow-sm scale-[1.03]"
                  : "border border-gray-200 bg-white text-zinc-900 hover:bg-gray-50",
                disabled && "pointer-events-none opacity-50",
              )}
              role="radio"
              aria-checked={selected}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
