import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/utils/utils";
import { authCardVariants } from "@/features/auth/motion/auth-motion-variants";

type Props = HTMLMotionProps<"div">;

export function AuthCard({ className, children, ...props }: Props) {
  return (
    <motion.div
      variants={authCardVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "w-full max-w-md rounded-2xl border border-white/40 bg-white/70 p-8 text-zinc-900 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)]",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
