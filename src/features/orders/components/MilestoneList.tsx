import { Skeleton } from "@/components/ui/skeleton";
import { AddMilestoneModal } from "@/features/orders/components/AddMilestoneModal";
import { MilestoneCard } from "@/features/orders/components/MilestoneCard";
import { useGetMilestonesByOrderQuery } from "@/features/orders";

export function MilestoneList({
  orderId,
  canEdit,
}: {
  orderId: string;
  canEdit: boolean;
}) {
  const q = useGetMilestonesByOrderQuery(orderId, {
    skip: !orderId,
    pollingInterval: 4000,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Milestones</h3>
          <p className="text-muted-foreground text-sm">
            pending → active → submitted → approved
          </p>
        </div>
        <AddMilestoneModal orderId={orderId} disabled={!canEdit} />
      </div>

      {q.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : q.isError ? (
        <p className="text-destructive text-sm">Failed to load milestones.</p>
      ) : (
        <div className="grid gap-3">
          {(q.data ?? []).map((m) => (
            <MilestoneCard key={m.id} milestone={m} canEdit={canEdit} />
          ))}
          {!q.data?.length ? (
            <p className="text-muted-foreground text-sm">No milestones yet.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
