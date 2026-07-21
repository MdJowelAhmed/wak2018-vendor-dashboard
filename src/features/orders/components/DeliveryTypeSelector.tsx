import { Label } from "@/components/ui/label";
import { cn } from "@/utils/utils";

export type DeliveryType = "local" | "international";

export function DeliveryTypeSelector({
  value,
  onChange,
}: {
  value: DeliveryType;
  onChange: (v: DeliveryType) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>Delivery Type</Label>
      <div className="grid gap-2">
        <button
          type="button"
          onClick={() => onChange("local")}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-3 text-left transition",
            value === "local"
              ? "border-[#895129] bg-[#895129]/5"
              : "border-border/60 hover:bg-muted/40",
          )}
        >
          <input
            aria-label="Local Delivery (Driver)"
            type="radio"
            name="deliveryType"
            checked={value === "local"}
            onChange={() => onChange("local")}
            className="mt-1"
          />
          <div className="min-w-0">
            <div className="font-medium">Local Delivery (Driver)</div>
            <div className="text-muted-foreground text-sm">
              Request a nearby driver to pick up and deliver.
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange("international")}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-3 text-left transition",
            value === "international"
              ? "border-[#895129] bg-[#895129]/5"
              : "border-border/60 hover:bg-muted/40",
          )}
        >
          <input
            aria-label="International Courier"
            type="radio"
            name="deliveryType"
            checked={value === "international"}
            onChange={() => onChange("international")}
            className="mt-1"
          />
          <div className="min-w-0">
            <div className="font-medium">International Courier</div>
            <div className="text-muted-foreground text-sm">
              Create a courier shipment (DHL, FedEx, UPS).
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
