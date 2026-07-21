import { CalendarClock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type OfferBubble = {
  offerId: string;
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number | null;
  status: OfferStatus;
};

type ChatOfferMessageProps = {
  mine: boolean;
  time: string;
  offer: OfferBubble;
  /** True when the signed-in viewer sent this offer (e.g. provider on service dashboard). */
  isSenderView: boolean;
  onAccept: () => void;
  onReject: () => void;
  onWithdraw: () => void;
};

const fmtUsd = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

function StatusBadge({ status }: { status: OfferStatus }) {
  if (status === "pending") {
    return (
      <Badge
        variant="outline"
        className="shrink-0 border-amber-200 bg-amber-50 text-xs text-amber-900"
      >
        Pending
      </Badge>
    );
  }
  if (status === "accepted") {
    return (
      <Badge
        variant="outline"
        className="shrink-0 border-emerald-200 bg-emerald-50 text-xs text-emerald-800"
      >
        Accepted
      </Badge>
    );
  }
  if (status === "withdrawn") {
    return (
      <Badge
        variant="outline"
        className="shrink-0 border-slate-200 bg-slate-50 text-xs text-slate-700"
      >
        Withdrawn
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="shrink-0 border-rose-200 bg-rose-50 text-xs text-rose-800"
    >
      Rejected
    </Badge>
  );
}

export function ChatOfferMessage({
  mine,
  time,
  offer,
  isSenderView,
  onAccept,
  onReject,
  onWithdraw,
}: ChatOfferMessageProps) {
  const pending = offer.status === "pending";

  return (
    <div className={cn("flex w-full", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "w-full max-w-[min(100%,22rem)] rounded-2xl border px-4 py-3 text-sm shadow-sm",
          mine
            ? "border-[#895129]/35 bg-[#895129]/8"
            : "border-border/60 bg-muted/50",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 font-semibold leading-snug">
            {offer.title}
          </div>
          <StatusBadge status={offer.status} />
        </div>
        <p className="text-muted-foreground mt-2 line-clamp-3 text-xs leading-relaxed">
          {offer.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="font-semibold text-[#895129]">
            {fmtUsd(offer.price)}
          </span>
          <span className="text-muted-foreground inline-flex items-center gap-1">
            <CalendarClock className="size-3.5" />
            {offer.deliveryDays} day{offer.deliveryDays === 1 ? "" : "s"}
          </span>
          {offer.revisions != null ? (
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <RefreshCw className="size-3.5" />
              {offer.revisions} revision{offer.revisions === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        {pending && isSenderView ? (
          <div className="mt-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 w-full border-[#895129]/40 text-[#895129] hover:bg-[#895129]/10 sm:w-auto"
              onClick={onWithdraw}
            >
              Withdraw
            </Button>
          </div>
        ) : null}

        {pending && !isSenderView ? (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              size="sm"
              className="h-9 flex-1 bg-[#895129] hover:bg-[#7b4723]"
              onClick={onAccept}
            >
              Accept
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 flex-1"
              onClick={onReject}
            >
              Reject
            </Button>
          </div>
        ) : null}

        <div
          className={cn(
            "mt-2 text-end text-[11px]",
            mine ? "text-[#895129]/80" : "text-muted-foreground",
          )}
        >
          {time}
        </div>
      </div>
    </div>
  );
}
