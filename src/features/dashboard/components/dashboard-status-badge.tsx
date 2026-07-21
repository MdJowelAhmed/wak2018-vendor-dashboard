import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";

const styles: Record<string, string> = {
  pending: "border-transparent bg-amber-400 text-white",
  processing: "border-transparent bg-sky-600 text-white",
  ready: "border-transparent bg-violet-600 text-white",
  delivery_requested: "border-transparent bg-orange-600 text-white",
  delivered: "border-transparent bg-emerald-600 text-white",
};

type Props = { statusKey: string; label: string; className?: string };

export function DashboardOrderStatusBadge({
  statusKey,
  label,
  className,
}: Props) {
  const c = styles[statusKey] ?? "border-border bg-secondary text-foreground";
  return (
    <Badge className={cn("shrink-0 font-medium capitalize", c, className)}>
      {label}
    </Badge>
  );
}
