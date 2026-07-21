import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/utils";
import {
  authInputFocusClass,
  authOtpCellFocusProps,
} from "@/features/auth/motion/auth-motion-variants";

const N = 6;

type Props = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  idPrefix?: string;
  disabled?: boolean;
};

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

export function OtpInput({
  value,
  onChange,
  className,
  idPrefix = "otp",
  disabled,
}: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const d = digitsOnly(value).slice(0, N);
  const cells = Array.from({ length: N }, (_, i) => d[i] ?? "");

  const firstEmptyIndex = Math.min(
    Math.max(
      cells.findIndex((c) => !c),
      0,
    ),
    N - 1,
  );

  function setAt(i: number, ch: string) {
    const digit = digitsOnly(ch).slice(-1) || "";
    const cur = digitsOnly(value).slice(0, N);
    const next = (cur.slice(0, i) + digit + cur.slice(i + 1)).slice(0, N);
    onChange(next);
    if (digit && i < N - 1) {
      refs.current[i + 1]?.focus();
    }
  }

  function onCellChange(i: number, raw: string) {
    if (raw.length === 0) {
      const cur = digitsOnly(value);
      onChange((cur.slice(0, i) + cur.slice(i + 1)).slice(0, N));
      return;
    }
    setAt(i, raw);
  }

  function onKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !cells[i] && i > 0) {
      e.preventDefault();
      const cur = digitsOnly(value);
      onChange((cur.slice(0, i - 1) + cur.slice(i)).slice(0, N));
      refs.current[i - 1]?.focus();
    }
  }

  function onPaste(e: ClipboardEvent) {
    e.preventDefault();
    onChange(digitsOnly(e.clipboardData.getData("text")).slice(0, N));
  }

  return (
    <div
      className={cn(
        "flex w-full max-w-sm flex-wrap justify-center gap-2",
        className,
      )}
      onPaste={onPaste}
      role="group"
      aria-label="6-digit one-time passcode"
    >
      {cells.map((c, i) => (
        <motion.input
          key={i}
          id={`${idPrefix}-${i}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          type="text"
          maxLength={1}
          value={c}
          disabled={disabled}
          autoFocus={i === firstEmptyIndex}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          onKeyDown={(e) => onKeyDown(i, e)}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => onCellChange(i, e.target.value)}
          {...authOtpCellFocusProps}
          className={cn(
            "h-14 w-12 rounded-xl border border-gray-200 bg-white/80 text-center text-xl text-zinc-900 shadow-sm",
            authInputFocusClass,
            disabled && "opacity-50",
          )}
        />
      ))}
    </div>
  );
}
