import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";
import {
  authInputFocusClass,
  authInputShakeTransition,
} from "@/features/auth/motion/auth-motion-variants";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  error?: string;
  /** Renders on the same row as the label (e.g. forgot-password link) */
  labelRight?: ReactNode;
};

export function PasswordInput({
  label,
  id: idProp,
  className,
  error,
  labelRight,
  ...inputProps
}: Props) {
  const autoId = useId();
  const id = idProp ?? `pwd-${autoId}`;
  const [show, setShow] = useState(false);

  return (
    <motion.div
      className="flex w-full flex-col gap-1.5"
      animate={error ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
      transition={authInputShakeTransition}
    >
      {labelRight ? (
        <div className="flex items-center justify-between gap-2">
          {label ? (
            <Label className="text-sm font-medium text-zinc-800" htmlFor={id}>
              {label}
            </Label>
          ) : (
            <span className="min-w-0" />
          )}
          {labelRight}
        </div>
      ) : label ? (
        <Label className="text-sm font-medium text-zinc-800" htmlFor={id}>
          {label}
        </Label>
      ) : null}
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          className={cn(
            // Premium input
            "h-12 rounded-xl border border-gray-200 bg-white/80 pr-10 text-zinc-900 shadow-sm",
            "placeholder:text-zinc-400",
            authInputFocusClass,
            error && "border-destructive",
            className,
          )}
          aria-invalid={!!error}
          autoComplete="current-password"
          {...inputProps}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute end-0 top-0 h-12 w-12 text-zinc-500 hover:bg-transparent"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>
      {error ? (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </motion.div>
  );
}
