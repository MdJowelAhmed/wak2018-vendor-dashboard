import { useEffect, useState } from "react";
import { DashboardModal } from "@/components/DashboardModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type OfferFormValues = {
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number | null;
};

type SendOfferModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTitle: string;
  onSend: (values: OfferFormValues) => void;
};

export function SendOfferModal({
  open,
  onOpenChange,
  defaultTitle,
  onSend,
}: SendOfferModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("3");
  const [includeRevisions, setIncludeRevisions] = useState(false);
  const [revisions, setRevisions] = useState("1");

  useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setDescription("");
      setPrice("");
      setDeliveryDays("3");
      setIncludeRevisions(false);
      setRevisions("1");
    }
  }, [open, defaultTitle]);

  function submit() {
    const p = Number.parseFloat(price);
    const d = Number.parseInt(deliveryDays, 10);
    let r: number | null = null;
    if (includeRevisions) {
      const rev = Number.parseInt(revisions, 10);
      if (Number.isNaN(rev) || rev < 0) return;
      r = rev;
    }
    if (
      !title.trim() ||
      !description.trim() ||
      Number.isNaN(p) ||
      p <= 0 ||
      Number.isNaN(d) ||
      d <= 0
    )
      return;
    onSend({
      title: title.trim(),
      description: description.trim(),
      price: p,
      deliveryDays: d,
      revisions: includeRevisions ? r : null,
    });
    onOpenChange(false);
  }

  const footer = (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() => onOpenChange(false)}
      >
        Cancel
      </Button>
      <Button
        type="button"
        className="w-full bg-[#895129] hover:bg-[#7b4723] sm:w-auto"
        onClick={submit}
      >
        Send Offer
      </Button>
    </div>
  );

  return (
    <DashboardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Send custom offer"
      description="Fiverr-style offer your customer can accept in chat."
      footer={footer}
      className="max-w-[min(92vw,26rem)]"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="offer-title">Service title</Label>
          <Input
            id="offer-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Landing page redesign"
            className="rounded-xl border-border/60"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="offer-desc">Description</Label>
          <Textarea
            id="offer-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What’s included, scope, and expectations…"
            className="min-h-[100px] rounded-xl border-border/60"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="offer-price">Price (USD)</Label>
            <Input
              id="offer-price"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="120"
              className="rounded-xl border-border/60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer-days">Delivery (days)</Label>
            <Input
              id="offer-days"
              inputMode="numeric"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              placeholder="7"
              className="rounded-xl border-border/60"
            />
          </div>
        </div>
        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={includeRevisions}
              onChange={(e) => setIncludeRevisions(e.target.checked)}
              className="size-4 rounded border-border text-[#895129] focus:ring-[#895129]"
            />
            Include revisions
          </label>
          {includeRevisions ? (
            <Input
              inputMode="numeric"
              value={revisions}
              onChange={(e) => setRevisions(e.target.value)}
              placeholder="Number of revisions"
              className="rounded-xl border-border/60"
            />
          ) : null}
        </div>
      </div>
    </DashboardModal>
  );
}
