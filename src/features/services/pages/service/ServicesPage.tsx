import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetMyServicesQuery,
  useDeleteServiceMutation,
  useUpdateServiceMutation,
} from "@/features/services";
import { CustomSpinner } from "@/components/common/CustomSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency, useCurrency } from "@/utils/format-currency";
import { cn, getImageUrl } from "@/utils/utils";

export function ServicesPage() {
  useCurrency();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: servicesData, isLoading, isFetching } = useGetMyServicesQuery({
    page,
    limit: 10,
    searchTerm: searchTerm.trim() || undefined,
  });
  const [deleteService] = useDeleteServiceMutation();
  const [updateService] = useUpdateServiceMutation();
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const services = servicesData?.data || [];
  const pagination = servicesData?.pagination;

  const fmtPrice = (price: number) => `${formatCurrency(price)} (Fixed)`;

  async function remove() {
    if (!serviceToDelete) return;
    try {
      await deleteService(serviceToDelete).unwrap();
      toast.success("Service deleted successfully");
      setServiceToDelete(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete service");
    }
  }

  async function toggle(id: string, currentStatus: string) {
    const nextStatus = currentStatus === "active" ? "draft" : "active";
    try {
      const formData = new FormData();
      formData.append("status", nextStatus);
      await updateService({ id, data: formData }).unwrap();
      toast.success(`Service marked as ${nextStatus}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update service status");
    }
  }

  if (isLoading) {
    return <CustomSpinner />;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">My Services</h1>
          <p className="text-muted-foreground text-sm">
            Manage your service listings and pricing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search services…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9"
            />
          </div>
          <Button asChild className="bg-[#895129] hover:bg-[#7b4723]">
            <Link to="/service/add-service">Add New Service</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Service Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Delivery Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Toggle</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length ? (
              services.map((s) => {
                const isActive = s.status === "active";

                const statusBadge = isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : s.status === "draft"
                    ? "border-zinc-200 bg-zinc-50 text-zinc-700"
                    : "border-red-200 bg-red-50 text-red-700";

                const statusLabel = isActive
                  ? "Active"
                  : s.status === "draft"
                    ? "Draft"
                    : "Inactive";

                return (
                  <TableRow key={s._id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {s.image && (
                          <img
                            src={getImageUrl(s.image)}
                            alt={s.name}
                            className="size-10 rounded-md object-cover border border-border/50"
                          />
                        )}
                        <span>{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {fmtPrice(s.price)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.deliveryTime} Days
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadge}>
                        {statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => toggle(s._id, s.status)}
                          className="data-[state=checked]:bg-[#895129]"
                          aria-label={`Toggle ${s.name}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-[#895129]/40 text-[#895129] hover:bg-[#895129]/10"
                        >
                          <button
                            type="button"
                            onClick={() => void navigate(`/service/${s._id}`)}
                          >
                            View
                          </button>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setServiceToDelete(s._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-12 text-center text-sm"
                >
                  No services found. Add a new service to get started!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPage > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-muted-foreground text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} services
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            {Array.from({ length: pagination.totalPage }, (_, i) => i + 1).map(
              (p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "size-8 p-0 text-xs",
                    p === page
                      ? "bg-[#895129] hover:bg-[#7b4723] text-white"
                      : ""
                  )}
                  disabled={isFetching}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPage || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={!!serviceToDelete}
        onOpenChange={(open) => !open && setServiceToDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex sm:justify-between space-x-2">
            <Button variant="outline" onClick={() => setServiceToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={remove}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
