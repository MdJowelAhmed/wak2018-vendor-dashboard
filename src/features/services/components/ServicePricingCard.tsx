import type { Service } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fmt = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);

export function ServicePricingCard({
  service,
  onEdit,
}: {
  service: Service;
  onEdit: () => void;
}) {
  const price =
    service.price ??
    (service.packages?.length
      ? Math.min(...service.packages.map((p) => p.price))
      : 0);
  const type = service.pricingType ?? "fixed";

  return (
    <Card className="rounded-xl border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="text-2xl font-semibold">{fmt(price)}</div>
          <div className="text-muted-foreground text-sm capitalize">{type}</div>
        </div>
        <Button
          type="button"
          className="w-full bg-[#895129] hover:bg-[#7b4723]"
          onClick={onEdit}
        >
          Edit Service
        </Button>
      </CardContent>
    </Card>
  );
}
