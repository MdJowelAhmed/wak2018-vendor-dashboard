import { useEffect, useState } from "react";
import { DashboardModal } from "@/components/DashboardModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGetMyServicesQuery } from "@/features/services/services/serviceApi";

export type OfferFormValues = {
  service: string;
  title: string;
  description: string;
  notes?: string;
  price: number;
};

type SendOfferModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTitle: string;
  onSend: (values: OfferFormValues) => void;
  isLoading?: boolean;
};

export function SendOfferModal({
  open,
  onOpenChange,
  defaultTitle,
  onSend,
  isLoading = false,
}: SendOfferModalProps) {
  const { data: servicesRes } = useGetMyServicesQuery();
  const servicesList = servicesRes?.data || [];

  const [serviceId, setServiceId] = useState("");
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setDescription("");
      setNotes("");
      setPrice("");
      if (servicesList.length > 0) {
        setServiceId(servicesList[0]._id);
      }
    }
  }, [open, defaultTitle, servicesList]);

  function submit() {
    const p = Number.parseFloat(price);
    if (
      !serviceId ||
      !title.trim() ||
      !description.trim() ||
      Number.isNaN(p) ||
      p <= 0
    ) {
      return;
    }

    onSend({
      service: serviceId,
      title: title.trim(),
      description: description.trim(),
      notes: notes.trim() || undefined,
      price: p,
    });
  }

  const footer = (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() => onOpenChange(false)}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        type="button"
        className="w-full bg-[#895129] hover:bg-[#7b4723] sm:w-auto"
        onClick={submit}
        disabled={isLoading || !serviceId || !title.trim() || !price}
      >
        {isLoading ? "Sending..." : "Send Offer"}
      </Button>
    </div>
  );

  return (
    <DashboardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Send custom offer"
      description="Create a custom service offer for your customer."
      footer={footer}
      className="max-w-[min(92vw,28rem)]"
    >
      <div className="space-y-4">
        {servicesList.length > 0 ? (
          <div className="space-y-2">
            <Label htmlFor="offer-service">Select Service</Label>
            <select
              id="offer-service"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full h-10 rounded-xl border border-border/60 bg-background px-3 text-sm"
            >
              {servicesList.map((s: any) => (
                <option key={s._id} value={s._id}>
                  {s.title || s.name || s._id}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="offer-service-id">Service ID</Label>
            <Input
              id="offer-service-id"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              placeholder="e.g. 6a572db5e613e58b9a0c7d63"
              className="rounded-xl border-border/60"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="offer-title">Offer Title</Label>
          <Input
            id="offer-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Custom MERN Stack Web Development"
            className="rounded-xl border-border/60"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="offer-desc">Description</Label>
          <Textarea
            id="offer-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Develop a responsive business website with admin panel and payment integration..."
            className="min-h-[90px] rounded-xl border-border/60"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="offer-notes">Notes (Optional)</Label>
          <Input
            id="offer-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. this is note"
            className="rounded-xl border-border/60"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="offer-price">Price (USD)</Label>
          <Input
            id="offer-price"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="450"
            className="rounded-xl border-border/60"
          />
        </div>
      </div>
    </DashboardModal>
  );
}
