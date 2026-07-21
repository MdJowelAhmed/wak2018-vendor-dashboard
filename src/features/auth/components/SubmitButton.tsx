import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/utils";
import type { ComponentProps, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { authButtonMotionProps } from "@/features/auth/motion/auth-motion-variants";

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

type Props = Omit<ButtonProps, "children"> & {
  children: ReactNode;
  loading?: boolean;
};

export function SubmitButton({
  children,
  loading,
  className,
  disabled,
  type = "submit",
  ...rest
}: Props) {
  return (
    <motion.div className="w-full" {...authButtonMotionProps}>
      <Button
        type={type}
        className={cn(
          "w-full rounded-xl bg-[#895129] py-3 font-semibold text-white shadow-md",
          "transition-colors duration-200 hover:bg-[#6f3f1f]",
          "focus-visible:ring-2 focus-visible:ring-[#895129] focus-visible:ring-offset-0",
          className,
        )}
        disabled={disabled || loading}
        {...rest}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            {children}
          </span>
        ) : (
          children
        )}
      </Button>
    </motion.div>
  );
}
