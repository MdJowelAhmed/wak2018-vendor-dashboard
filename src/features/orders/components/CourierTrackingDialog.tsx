import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CourierTrackingDialog({
  open,
  onOpenChange,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
  onSubmit: (values: {
    carrier: string;
    trackingId: string;
    trackingUrl?: string;
  }) => Promise<void>;
}) {
  const [carrier, setCarrier] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  function reset() {
    setCarrier("");
    setTrackingId("");
    setTrackingUrl("");
  }

  async function submit() {
    if (!carrier.trim()) {
      toast.error("Enter the courier name");
      return;
    }
    if (!trackingId.trim()) {
      toast.error("Enter the tracking ID");
      return;
    }
    try {
      await onSubmit({
        carrier: carrier.trim(),
        trackingId: trackingId.trim(),
        trackingUrl: trackingUrl.trim() || undefined,
      });
      reset();
    } catch {
      /* parent shows the error */
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Courier tracking</DialogTitle>
          <DialogDescription>
            Add your courier name and tracking details before marking this order
            as shipped.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="carrier">Courier</Label>
            <Input
              id="carrier"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="Redx Courier"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trackingId">Tracking ID</Label>
            <Input
              id="trackingId"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="RDX12345678"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trackingUrl">Tracking URL (optional)</Label>
            <Input
              id="trackingUrl"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://redx.com.bd/track/RDX12345678"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#895129] hover:bg-[#7b4723]"
            onClick={() => void submit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Mark as shipped"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
