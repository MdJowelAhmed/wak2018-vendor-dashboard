import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCreateDeliveryRequestMutation } from "@/features/delivery";
import { useGetUserProfileQuery } from "@/services/profileApi";
import { useUpdateProductOrderStatusMutation } from "@/features/orders";
import type { ProductOrder } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Truck } from "lucide-react";

type Props = {
  order: ProductOrder;
  onSent?: () => void;
  disabled?: boolean;
};

export function RequestDeliveryButton({ order, onSent, disabled }: Props) {
  const { data: profileRes } = useGetUserProfileQuery();
  const profile = profileRes?.data;
  const [open, setOpen] = useState(false);
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [createReq, { isLoading }] = useCreateDeliveryRequestMutation();
  const [updateOrder] = useUpdateProductOrderStatusMutation();

  const vendorId =
    profile?.id ?? localStorage.getItem("vendor_id") ?? "demo-vendor";

  useEffect(() => {
    if (open) {
      setDrop("");
    }
  }, [open, order.id]);

  const canRequest = order.status === "ready" || order.status === "confirmed";

  async function handleSend() {
    if (!pickup.trim() || !drop.trim()) {
      toast.error("Add pickup and drop locations.");
      return;
    }
    try {
      await createReq({
        order_id: order.id,
        pickup_location: pickup.trim(),
        drop_location: drop.trim(),
        vendor_id: vendorId,
      }).unwrap();
      try {
        await updateOrder({
          id: order.id,
          status: "delivery_requested",
        }).unwrap();
      } catch {
        // Backend may already set status when creating delivery; ignore secondary failure
      }
      toast.success("Delivery request sent to drivers");
      setOpen(false);
      setPickup("");
      setDrop("");
      onSent?.();
    } catch {
      toast.error("Failed to create delivery request");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="default"
          disabled={disabled || !canRequest}
          className="gap-1.5"
        >
          <Truck className="size-3.5" />
          Request delivery
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request delivery</DialogTitle>
          <DialogDescription>
            Order {order.id} · {order.productName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="oid">Order ID</Label>
            <Input id="oid" value={order.id} readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pickup">Pickup location</Label>
            <Textarea
              id="pickup"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              rows={2}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="drop">Drop location</Label>
            <Textarea
              id="drop"
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              rows={2}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSend} disabled={isLoading}>
            {isLoading ? "Sending…" : "Send request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
