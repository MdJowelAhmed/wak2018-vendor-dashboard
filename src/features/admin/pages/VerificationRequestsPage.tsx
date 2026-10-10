import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { logout } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/app/hooks";
import {
  useGetVerificationRequestQuery,
  useGetVerificationRequestsQuery,
  useUpdateVerificationStatusMutation,
  type VerificationRequest,
  type VerificationStatus,
  type VerificationType,
} from "@/features/admin/services/verificationApi";

function userName(request: VerificationRequest) {
  const user = request.user;
  if (!user || typeof user === "string") return "—";
  return user.businessName || user.name || user.email || "—";
}

function userEmail(request: VerificationRequest) {
  const user = request.user;
  if (!user || typeof user === "string") return "";
  return user.email || "";
}

function statusClass(status: string) {
  if (status === "approved") return "bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-800";
}

function isImage(url: string) {
  return /\.(jpe?g|png)(\?|$)/i.test(url);
}

export function VerificationRequestsPage() {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<VerificationStatus | "all">("pending");
  const [type, setType] = useState<VerificationType | "all">("vendor");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const limit = 10;

  const listQ = useGetVerificationRequestsQuery({
    status: status === "all" ? undefined : status,
    type: type === "all" ? undefined : type,
    page,
    limit,
  });
  const detailQ = useGetVerificationRequestQuery(selectedId ?? "", {
    skip: !selectedId,
  });
  const [updateStatus, { isLoading: updating }] =
    useUpdateVerificationStatusMutation();

  const rows = listQ.data?.data ?? [];
  const totalPages = Math.max(1, listQ.data?.pagination?.totalPage ?? 1);
  const detail = detailQ.data;

  async function decide(next: "approved" | "rejected") {
    if (!selectedId) return;
    try {
      await updateStatus({ id: selectedId, status: next }).unwrap();
      toast.success(
        next === "approved" ? "Verification approved" : "Verification rejected",
      );
      setSelectedId(null);
    } catch {
      toast.error("Could not update verification status");
    }
  }

  return (
    <div className="min-h-svh bg-[#f7f4f1] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Verification requests
            </h1>
            <p className="text-sm text-gray-500">
              Review vendor and rider KYC documents, then approve or reject.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch(logout())}
          >
            Log out
          </Button>
        </div>

        <Card className="rounded-2xl border-gray-100 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Requests</CardTitle>
              <CardDescription>
                Private documents open with a short-lived link.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value as VerificationStatus | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value as VerificationType | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="rider">Rider</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {listQ.isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : listQ.isError ? (
              <p className="text-destructive text-sm">
                Failed to load verification requests.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell>
                        <div className="font-medium">{userName(row)}</div>
                        <div className="text-muted-foreground text-xs">
                          {userEmail(row)}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{row.type}</TableCell>
                      <TableCell>
                        <Badge className={statusClass(String(row.status))}>
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedId(row._id)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!rows.length ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-muted-foreground py-8 text-center"
                      >
                        No verification requests.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review documents</DialogTitle>
            <DialogDescription>
              Links expire about 20 minutes after this request is opened.
            </DialogDescription>
          </DialogHeader>
          {detailQ.isLoading || !detail ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{userName(detail)}</p>
                  <p className="text-muted-foreground text-xs">
                    {userEmail(detail)}
                  </p>
                </div>
                <Badge className={statusClass(String(detail.status))}>
                  {detail.status}
                </Badge>
              </div>
              <div className="grid gap-4">
                {(detail.documents ?? []).map((doc) => (
                  <div
                    key={`${doc.type}-${doc.key ?? doc.url}`}
                    className="rounded-xl border border-gray-200 p-3"
                  >
                    <p className="mb-2 text-sm font-medium capitalize">
                      {doc.type.replace(/([A-Z])/g, " $1")}
                    </p>
                    {isImage(doc.url) ? (
                      <img
                        src={doc.url}
                        alt={doc.type}
                        className="max-h-80 w-full rounded-lg object-contain bg-gray-50"
                      />
                    ) : (
                      <iframe
                        title={doc.type}
                        src={doc.url}
                        className="h-80 w-full rounded-lg border border-gray-100"
                      />
                    )}
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-[#895129]"
                    >
                      Open document
                    </a>
                  </div>
                ))}
                {!detail.documents?.length ? (
                  <p className="text-muted-foreground text-sm">
                    No documents on this request.
                  </p>
                ) : null}
              </div>
              {detail.status === "pending" ? (
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updating}
                    onClick={() => void decide("rejected")}
                  >
                    Reject
                  </Button>
                  <Button
                    type="button"
                    className="bg-[#895129] hover:bg-[#7b4723]"
                    disabled={updating}
                    onClick={() => void decide("approved")}
                  >
                    Approve
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
