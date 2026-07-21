import * as React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/utils";
import {
  authInputFocusClass,
  authInputShakeTransition,
} from "@/features/auth/motion/auth-motion-variants";

type Props = React.ComponentProps<"input"> & {
  label: string;
  id: string;
  error?: string;
  hint?: string;
};

export const InputField = React.forwardRef<HTMLInputElement, Props>(
  function InputField(
    { label, id, error, hint, className, ...inputProps },
    ref,
  ) {
    return (
      <motion.div
        className={cn("flex w-full flex-col gap-1.5", className)}
        animate={error ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
        transition={authInputShakeTransition}
      >
        <Label className="text-sm font-medium text-zinc-800" htmlFor={id}>
          {label}
        </Label>
        <Input
          ref={ref}
          id={id}
          className={cn(
            // Premium input
            "h-12 rounded-xl border border-gray-200 bg-white/80 text-zinc-900 shadow-sm",
            "placeholder:text-zinc-400",
            authInputFocusClass,
            error && "border-destructive",
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          {...inputProps}
        />
        {hint && !error ? (
          <p id={`${id}-hint`} className="text-xs text-zinc-500">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p
            id={`${id}-error`}
            className="text-destructive text-xs"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </motion.div>
    );
  },
);
