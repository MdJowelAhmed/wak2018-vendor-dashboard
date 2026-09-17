import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ImagePlus, MessageCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/utils";
import { toast } from "sonner";
import {
  useGetServiceOrderByIdQuery,
  useDeliverServiceOrderMutation,
} from "@/features/orders/services/orderApi";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency as fmtUsd, useCurrency } from "@/utils/format-currency";

const MAX_DELIVERY_IMAGES = 3;
const MAX_DELIVERY_DOCS = 3;

const DOC_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
]);

const DOC_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".zip",
]);

const DOC_ACCEPT = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".zip",
  ...DOC_MIME_TYPES,
].join(",");

function isAllowedDoc(file: File) {
  if (DOC_MIME_TYPES.has(file.type)) return true;
  const dot = file.name.lastIndexOf(".");
  if (dot < 0) return false;
  return DOC_EXTENSIONS.has(file.name.slice(dot).toLowerCase());
}

function addCappedFiles(
  current: File[],
  incoming: File[],
  max: number,
  kind: string,
) {
  const remaining = max - current.length;
  if (remaining <= 0) {
    toast.error(`You can upload up to ${max} ${kind}`);
    return current;
  }
  if (incoming.length > remaining) {
    toast.error(`You can upload up to ${max} ${kind}`);
  }
  return [...current, ...incoming.slice(0, remaining)];
}

function ImageThumb({
  file,
  onRemove,
  disabled,
}: {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  if (!url) return null;

  return (
    <div className="relative size-16 overflow-hidden rounded-lg border border-border/60">
      <img src={url} alt={file.name} className="h-full w-full object-cover" />
      <button
        type="button"
        className="absolute right-0.5 top-0.5 rounded-md bg-black/60 p-0.5 text-white hover:bg-black/80"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        disabled={disabled}
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

function fmtDate(ymd: string) {
  if (!ymd) return "—";
  const d = new Date(ymd);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "in_progress":
      return "border-[#895129]/35 bg-[#895129]/10 text-[#895129]";
    case "pending":
      return "border-zinc-200 bg-zinc-50 text-zinc-800";
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-800";
    default:
      return "border-border bg-muted text-foreground";
  }
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[#895129] text-xs font-semibold uppercase tracking-wide">
      {children}
    </h3>
  );
}

function InfoItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="text-sm font-medium leading-snug break-words">
        {value || "—"}
      </div>
    </div>
  );
}

type BookingDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string | null;
};

export function BookingDetailsModal({
  open,
  onOpenChange,
  bookingId,
}: BookingDetailsModalProps) {
  useCurrency();
  const navigate = useNavigate();

  const { data: b, isLoading } = useGetServiceOrderByIdQuery(bookingId ?? "", {
    skip: !bookingId,
  });

  const [deliverOrder, { isLoading: isDelivering }] =
    useDeliverServiceOrderMutation();
  const [deliveryDescription, setDeliveryDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [docs, setDocs] = useState<File[]>([]);

  useEffect(() => {
    setDeliveryDescription("");
    setImages([]);
    setDocs([]);
  }, [bookingId, open]);

  function close() {
    onOpenChange(false);
  }

  function openChat() {
    close();
    void navigate("/service/messages");
  }

  function onPickImages(list: FileList | null) {
    if (!list?.length) return;
    const valid = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (!valid.length) {
      toast.error("Please select valid image files");
      return;
    }
    setImages((prev) =>
      addCappedFiles(prev, valid, MAX_DELIVERY_IMAGES, "images"),
    );
  }

  function onPickDocs(list: FileList | null) {
    if (!list?.length) return;
    const incoming = Array.from(list);
    const valid = incoming.filter(isAllowedDoc);
    if (valid.length !== incoming.length) {
      toast.error(
        "Documents must be PDF, Word, Excel, PowerPoint, text, CSV, or ZIP",
      );
    }
    if (!valid.length) return;
    setDocs((prev) =>
      addCappedFiles(prev, valid, MAX_DELIVERY_DOCS, "documents"),
    );
  }

  async function handleDeliver() {
    if (!bookingId) return;
    const description = deliveryDescription.trim();
    if (!description) {
      toast.error("Delivery description is required");
      return;
    }
    try {
      await deliverOrder({
        id: bookingId,
        deliveryDescription: description,
        images,
        docs,
      }).unwrap();
      toast.success("Order marked as delivered!");
      setDeliveryDescription("");
      setImages([]);
      setDocs([]);
    } catch (err: any) {
      const first = err?.data?.errorMessages?.[0];
      toast.error(
        first?.message
          ? `${first.path ? `${first.path}: ` : ""}${first.message}`
          : err?.data?.message || "Failed to deliver order",
      );
    }
  }

  if (!bookingId) return null;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[min(96vw,56rem)] rounded-xl border-border/60 bg-white">
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full mt-4" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!b) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[min(96vw,56rem)] rounded-xl border-border/60 bg-white">
          <p className="text-muted-foreground text-sm">Booking not found.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const timelineSteps = [
    { key: "created", label: "Created", done: true, date: b.createdAt },
    {
      key: "ongoing",
      label: "Ongoing",
      done: b.orderStatus === "in_progress" || b.orderStatus === "completed",
      date: b.orderStatus !== "pending" ? b.updatedAt : undefined,
    },
    {
      key: "completed",
      label: "Completed",
      done: b.orderStatus === "completed",
      date:
        b.completedAt ||
        (b.orderStatus === "completed" ? b.updatedAt : undefined),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="flex max-h-[min(90vh,44rem)] max-w-[min(96vw,56rem)] flex-col gap-0 overflow-hidden rounded-xl border-border/60 bg-white p-0 shadow-lg"
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border/60 px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold">
            Booking details
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {b.orderId} · Manage status and view delivery context.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            {/* Timeline */}
            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
              <div className="text-muted-foreground mb-3 text-xs font-medium">
                Progress
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                {timelineSteps.map((step, i) => (
                  <div
                    key={step.key}
                    className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial"
                  >
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        step.done
                          ? "bg-[#895129] text-white"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={cn(
                          "text-sm font-medium",
                          step.done
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </div>
                      {step.date ? (
                        <div className="text-muted-foreground text-xs">
                          {fmtDate(step.date)}
                        </div>
                      ) : null}
                    </div>
                    {i < timelineSteps.length - 1 ? (
                      <div className="bg-border mx-1 hidden h-px w-6 shrink-0 sm:block" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              {/* Service */}
              <div className="space-y-3">
                <SectionTitle>Service info</SectionTitle>
                <Separator />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Service name"
                    value={b.service?.name}
                    className="sm:col-span-2"
                  />
                  <InfoItem
                    label="Description"
                    value={b.service?.description}
                    className="sm:col-span-2"
                  />
                </div>
              </div>

              {/* Customer */}
              <div className="space-y-3">
                <SectionTitle>Customer info</SectionTitle>
                <Separator />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Name"
                    value={b.customer?.name}
                    className="sm:col-span-2"
                  />
                  <InfoItem label="Email" value={b.customer?.email} />
                </div>
              </div>

              {/* Booking */}
              <div className="space-y-3">
                <SectionTitle>Booking info</SectionTitle>
                <Separator />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem label="Booking ID" value={b.orderId} />
                  <InfoItem label="Date" value={fmtDate(b.createdAt)} />
                  <InfoItem label="Status" value="" className="hidden" />
                  <div className="space-y-2 sm:col-span-2">
                    <div className="text-muted-foreground text-xs">Status</div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs capitalize",
                          statusBadgeClass(b.orderStatus),
                        )}
                      >
                        {b.orderStatus === "in_progress"
                          ? "Ongoing"
                          : b.orderStatus}
                      </Badge>
                    </div>
                  </div>
                  <InfoItem
                    label="Payment Status"
                    value={b.paymentStatus || "Unpaid"}
                    className="sm:col-span-2 capitalize"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-3">
                <SectionTitle>Pricing</SectionTitle>
                <Separator />
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-border/60 bg-muted/15 p-4 sm:grid-cols-2">
                  <InfoItem
                    label="Base price"
                    value={fmtUsd(b.service?.price || 0)}
                  />
                  <div className="border-border/60 flex items-center justify-between border-t pt-3 sm:col-span-2">
                    <span className="text-muted-foreground text-sm">Total</span>
                    <span className="text-[#895129] text-lg font-semibold tabular-nums">
                      {fmtUsd(b.price || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="space-y-3 lg:col-span-2">
                <SectionTitle>Delivery</SectionTitle>
                <Separator />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoItem
                    label="Expected Delivery"
                    value={fmtDate(b.deliveryDate)}
                  />
                  {b.completedAt && (
                    <InfoItem
                      label="Completed At"
                      value={fmtDate(b.completedAt)}
                    />
                  )}
                </div>
                {b.deliveryDescription && (
                  <div className="mt-4 rounded-lg bg-muted/30 p-4 border border-border/50 text-sm">
                    <span className="font-semibold text-xs text-muted-foreground block mb-2">
                      Delivery Note
                    </span>
                    {b.deliveryDescription}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <SectionTitle>Actions</SectionTitle>
              {b.orderStatus === "in_progress" ||
              b.orderStatus === "pending" ? (
                <div className="space-y-4 rounded-xl border border-border/60 bg-muted/15 p-4">
                  <div className="grid gap-2">
                    <Label htmlFor="deliveryDescription">
                      Delivery description{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="deliveryDescription"
                      value={deliveryDescription}
                      onChange={(e) => setDeliveryDescription(e.target.value)}
                      placeholder="Describe what was delivered…"
                      rows={3}
                      disabled={isDelivering}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label>Images</Label>
                        <span className="text-muted-foreground text-xs">
                          {images.length}/{MAX_DELIVERY_IMAGES}
                        </span>
                      </div>
                      <Button
                        asChild
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full cursor-pointer"
                        disabled={
                          isDelivering || images.length >= MAX_DELIVERY_IMAGES
                        }
                      >
                        <label>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            disabled={
                              isDelivering ||
                              images.length >= MAX_DELIVERY_IMAGES
                            }
                            onChange={(e) => {
                              onPickImages(e.currentTarget.files);
                              e.currentTarget.value = "";
                            }}
                          />
                          <ImagePlus className="mr-2 size-4" />
                          Add images
                        </label>
                      </Button>
                      {images.length ? (
                        <div className="flex flex-wrap gap-2">
                          {images.map((file, i) => (
                            <ImageThumb
                              key={`${file.name}-${file.size}-${i}`}
                              file={file}
                              disabled={isDelivering}
                              onRemove={() =>
                                setImages((prev) =>
                                  prev.filter((_, idx) => idx !== i),
                                )
                              }
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label>Documents</Label>
                        <span className="text-muted-foreground text-xs">
                          {docs.length}/{MAX_DELIVERY_DOCS}
                        </span>
                      </div>
                      <Button
                        asChild
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full cursor-pointer"
                        disabled={
                          isDelivering || docs.length >= MAX_DELIVERY_DOCS
                        }
                      >
                        <label>
                          <input
                            type="file"
                            accept={DOC_ACCEPT}
                            multiple
                            className="hidden"
                            disabled={
                              isDelivering || docs.length >= MAX_DELIVERY_DOCS
                            }
                            onChange={(e) => {
                              onPickDocs(e.currentTarget.files);
                              e.currentTarget.value = "";
                            }}
                          />
                          <FileText className="mr-2 size-4" />
                          Add documents
                        </label>
                      </Button>
                      {docs.length ? (
                        <div className="flex flex-col gap-1.5">
                          {docs.map((file, i) => (
                            <div
                              key={`${file.name}-${i}`}
                              className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2 py-1.5"
                            >
                              <FileText className="size-4 shrink-0 text-muted-foreground" />
                              <span className="min-w-0 flex-1 truncate text-xs font-medium">
                                {file.name}
                              </span>
                              <button
                                type="button"
                                className="rounded-md p-0.5 text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  setDocs((prev) =>
                                    prev.filter((_, idx) => idx !== i),
                                  )
                                }
                                aria-label={`Remove ${file.name}`}
                                disabled={isDelivering}
                              >
                                <X className="size-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-xs">
                          PDF, Word, Excel, PowerPoint, text, CSV, or ZIP
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      className="bg-[#895129] hover:bg-[#7b4723]"
                      onClick={handleDeliver}
                      disabled={isDelivering || !deliveryDescription.trim()}
                    >
                      {isDelivering ? "Delivering..." : "Deliver Order"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0 border-[#895129]/40 text-[#895129] hover:bg-[#895129]/10 ml-auto"
                      onClick={openChat}
                    >
                      <MessageCircle className="mr-2 size-4" />
                      Open chat
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-row flex-wrap items-center gap-2">
                  {b.orderStatus === "completed" ? (
                    <p className="text-muted-foreground text-sm">
                      No further actions — booking is completed.
                    </p>
                  ) : null}
                  {b.orderStatus === "cancelled" ? (
                    <p className="text-muted-foreground text-sm">
                      No actions available for this booking.
                    </p>
                  ) : null}

                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 border-[#895129]/40 text-[#895129] hover:bg-[#895129]/10 ml-auto"
                    onClick={openChat}
                  >
                    <MessageCircle className="mr-2 size-4" />
                    Open chat
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
