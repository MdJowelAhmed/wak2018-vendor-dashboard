import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { Package, Sparkles } from "lucide-react";
import {
  authFormColumnVariants,
  authIllustrationVariants,
  authPageLoadTransition,
  authRouteStepVariants,
} from "@/features/auth/motion/auth-motion-variants";

export function AuthLayout() {
  const location = useLocation();

  return (
    <div className="relative min-h-svh overflow-hidden bg-gradient-to-br from-[#f9f7f5] via-white to-[#f3ede8]">
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-[#895129] blur-3xl opacity-20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-24 h-[30rem] w-[30rem] rounded-full bg-[#c09a7a] blur-3xl opacity-20"
        aria-hidden
      />

      <motion.div
        className="relative flex min-h-svh flex-col lg:flex-row"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={authPageLoadTransition}
      >
        <motion.aside
          className="relative hidden min-h-svh w-full flex-col justify-center border-r border-white/30 bg-white/25 px-10 py-14 backdrop-blur-md lg:flex lg:max-w-[46%] lg:px-14"
          variants={authIllustrationVariants}
          initial="hidden"
          animate="visible"
          aria-hidden
        >
          <div className="mx-auto max-w-md space-y-8">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#895129]/15 text-[#895129] shadow-sm">
              <Package className="size-7" strokeWidth={1.75} />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Welcome to Wak
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600">
                Manage products, services, orders, and deliveries from one calm
                dashboard — built for vendors and service providers.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-zinc-600">
              {[
                "Secure sign-in",
                "Role-based workspaces",
                "Fast onboarding",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Sparkles className="size-4 shrink-0 text-[#895129]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </motion.aside>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:py-14">
          <motion.div
            className="flex w-full max-w-md justify-center lg:max-w-none lg:flex-1"
            variants={authFormColumnVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={authRouteStepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex w-full justify-center"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
