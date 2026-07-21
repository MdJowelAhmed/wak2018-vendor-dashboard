import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import { useCreateMilestoneMutation } from "@/features/orders";

export function AddMilestoneModal({
  orderId,
  disabled,
}: {
  orderId: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const [create, { isLoading }] = useCreateMilestoneMutation();

  const canSubmit = useMemo(() => {
    const a = Number(amount);
    return title.trim().length >= 3 && Number.isFinite(a) && a > 0;
  }, [title, amount]);

  async function onSubmit() {
    if (!canSubmit) {
      toast.error("Add a title and a valid amount.");
      return;
    }
    try {
      await create({
        orderId,
        title: title.trim(),
        description: description.trim(),
        amount: Number(amount),
      }).unwrap();
      toast.success("Milestone added");
      setOpen(false);
      setTitle("");
      setDescription("");
      setAmount("0");
    } catch {
      toast.error("Could not add milestone");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          disabled={disabled}
          className="bg-[#895129] hover:bg-[#7b4723]"
        >
          Add milestone
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add milestone</DialogTitle>
          <DialogDescription>
            Break the service order into clear steps with payments.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="mst">Title</Label>
            <Input
              id="mst"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. First draft"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="msd">Description</Label>
            <Textarea
              id="msd"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What will be delivered?"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="msa">Amount</Label>
            <Input
              id="msa"
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void onSubmit()}
            disabled={isLoading || !canSubmit}
            className="bg-[#895129] hover:bg-[#7b4723]"
          >
            {isLoading ? "Saving…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
