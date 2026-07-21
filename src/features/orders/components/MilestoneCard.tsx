import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Milestone, MilestoneStatus } from "@/types/api";
import {
  useDeleteMilestoneMutation,
  useUpdateMilestoneMutation,
  useUpdateMilestoneStatusMutation,
} from "@/features/orders";
import { cn } from "@/utils/utils";

const flow: MilestoneStatus[] = ["pending", "active", "submitted", "approved"];

function nextOf(s: MilestoneStatus): MilestoneStatus | null {
  const i = flow.indexOf(s);
  if (i < 0 || i >= flow.length - 1) return null;
  return flow[i + 1] ?? null;
}

export function MilestoneCard({
  milestone,
  canEdit,
}: {
  milestone: Milestone;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(milestone.title);
  const [description, setDescription] = useState(milestone.description);
  const [amount, setAmount] = useState(String(milestone.amount));

  const [update] = useUpdateMilestoneMutation();
  const [updateStatus, { isLoading: moving }] =
    useUpdateMilestoneStatusMutation();
  const [del, { isLoading: deleting }] = useDeleteMilestoneMutation();

  const canSave = useMemo(() => {
    const a = Number(amount);
    return title.trim().length >= 3 && Number.isFinite(a) && a > 0;
  }, [title, amount]);

  const next = nextOf(milestone.status);

  async function save() {
    if (!canSave) return;
    try {
      await update({
        id: milestone.id,
        orderId: milestone.orderId,
        title: title.trim(),
        description: description.trim(),
        amount: Number(amount),
      }).unwrap();
      toast.success("Milestone updated");
      setEditing(false);
    } catch {
      toast.error("Update failed");
    }
  }

  async function move() {
    if (!next) return;
    try {
      await updateStatus({
        id: milestone.id,
        orderId: milestone.orderId,
        status: next,
      }).unwrap();
      toast.success("Status updated");
    } catch {
      toast.error("Status update failed");
    }
  }

  async function remove() {
    try {
      await del({ id: milestone.id, orderId: milestone.orderId }).unwrap();
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <Card className="rounded-xl border-border/60 shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base truncate">
            {milestone.title}
          </CardTitle>
          <p className="text-muted-foreground text-xs capitalize">
            {milestone.status} ·{" "}
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: "USD",
            }).format(milestone.amount)}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {next ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void move()}
              disabled={moving}
            >
              {next === "active"
                ? "Start"
                : next === "submitted"
                  ? "Submit"
                  : "Approve"}
            </Button>
          ) : null}
          {canEdit ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? "Close" : "Edit"}
            </Button>
          ) : null}
          {canEdit ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void remove()}
              disabled={deleting}
            >
              Delete
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className={cn("text-muted-foreground", editing && "hidden")}>
          {milestone.description || "—"}
        </p>

        {editing ? (
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-[#895129] hover:bg-[#7b4723]"
                onClick={() => void save()}
                disabled={!canSave}
              >
                Save
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
