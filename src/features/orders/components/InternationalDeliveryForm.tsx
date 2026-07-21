import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type CourierKey = "dhl" | "fedex" | "ups";

export function InternationalDeliveryForm({
  courier,
  weight,
  dimensions,
  pickup,
  drop,
  onChangeCourier,
  onChangeWeight,
  onChangeDimensions,
  onChangePickup,
  onChangeDrop,
}: {
  courier: CourierKey;
  weight: string;
  dimensions: string;
  pickup: string;
  drop: string;
  onChangeCourier: (v: CourierKey) => void;
  onChangeWeight: (v: string) => void;
  onChangeDimensions: (v: string) => void;
  onChangePickup: (v: string) => void;
  onChangeDrop: (v: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Courier</Label>
        <Select
          value={courier}
          onValueChange={(v) => onChangeCourier(v as CourierKey)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dhl">DHL</SelectItem>
            <SelectItem value="fedex">FedEx</SelectItem>
            <SelectItem value="ups">UPS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="weight">Package weight</Label>
          <Input
            id="weight"
            type="number"
            min={0}
            inputMode="decimal"
            value={weight}
            onChange={(e) => onChangeWeight(e.target.value)}
            placeholder="e.g. 1.5"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dims">Dimensions</Label>
          <Input
            id="dims"
            value={dimensions}
            onChange={(e) => onChangeDimensions(e.target.value)}
            placeholder="L x W x H"
          />
        </div>
      </div>

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
        <Label htmlFor="drop">Delivery address</Label>
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
