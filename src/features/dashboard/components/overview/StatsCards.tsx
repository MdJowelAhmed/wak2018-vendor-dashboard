import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { cn } from "@/utils/utils";
import { fadeUp, hoverLift, staggerContainer } from "@/components/ui/motion";

export type StatCard = {
  key: string;
  label: string;
  value: string;
  sub?: string;
  icon: ComponentType<{ className?: string }>;
};

function parseNumberLike(text: string) {
  const cleaned = text.replace(/[^0-9.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function formatterFromTemplate(template: string) {
  const hasPct = template.includes("%");
  const hasDollar = template.includes("$");

  if (hasPct) return (n: number) => `${n.toFixed(0)}%`;
  if (hasDollar)
    return (n: number) =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
      }).format(n);

  return (n: number) => new Intl.NumberFormat().format(Math.round(n));
}

export function StatsCards({
  items,
  isLoading,
  className,
}: {
  items: StatCard[];
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
      variants={staggerContainer(0.08, 0.04)}
      initial="hidden"
      animate="show"
    >
      {items.map((s) => (
        <motion.div
          key={s.key}
          variants={fadeUp}
          whileHover={hoverLift.whileHover}
          transition={hoverLift.transition}
        >
          <Card className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 py-0 shadow-sm transition-shadow duration-300 hover:shadow-xl">
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
            </div>

            <CardContent className="flex h-full items-start justify-between gap-3 p-6">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-gray-500">{s.label}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-28" />
                ) : (
                  <>
                    <p className="text-3xl font-bold tracking-tight text-gray-900">
                      {(() => {
                        const n = parseNumberLike(s.value);
                        if (n == null)
                          return (
                            <span className="tabular-nums">{s.value}</span>
                          );
                        return (
                          <AnimatedNumber
                            value={n}
                            format={formatterFromTemplate(s.value)}
                          />
                        );
                      })()}
                    </p>
                    {s.sub && <p className="text-xs text-gray-500">{s.sub}</p>}
                  </>
                )}
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <s.icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
