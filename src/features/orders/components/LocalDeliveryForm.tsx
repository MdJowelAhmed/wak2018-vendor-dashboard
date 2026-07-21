import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function LocalDeliveryForm({
  pickup,
  drop,
  onChangePickup,
  onChangeDrop,
}: {
  pickup: string;
  drop: string;
  onChangePickup: (v: string) => void;
  onChangeDrop: (v: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="pickup">Pickup address</Label>
        <Textarea
          id="pickup"
          value={pickup}
          onChange={(e) => onChangePickup(e.target.value)}
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="drop">Drop address</Label>
        <Textarea
          id="drop"
          value={drop}
          onChange={(e) => onChangeDrop(e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
}
