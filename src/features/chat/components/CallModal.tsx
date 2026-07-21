import { useEffect, useRef, useState } from "react";
import { Mic, PhoneOff, Video } from "lucide-react";
import { DashboardModal } from "@/components/DashboardModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

export type CallKind = "audio" | "video";

type CallPhase = "pick" | "calling" | "connected" | "ended";

type CallModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CallModal({ open, onOpenChange }: CallModalProps) {
  const [kind, setKind] = useState<CallKind | null>(null);
  const [phase, setPhase] = useState<CallPhase>("pick");
  const timers = useRef<number[]>([]);

  function clearTimers() {
    for (const t of timers.current) window.clearTimeout(t);
    timers.current = [];
  }

  useEffect(() => {
    if (!open) {
      clearTimers();
      setKind(null);
      setPhase("pick");
      return;
    }
    setKind(null);
    setPhase("pick");
    return () => clearTimers();
  }, [open]);

  function startCall() {
    if (!kind) return;
    setPhase("calling");
    const t1 = window.setTimeout(() => setPhase("connected"), 1600);
    timers.current.push(t1);
  }

  function endCall() {
    setPhase("ended");
    const t2 = window.setTimeout(() => {
      onOpenChange(false);
    }, 1200);
    timers.current.push(t2);
  }

  const statusLabel =
    phase === "pick"
      ? "Choose how you want to connect"
      : phase === "calling"
        ? kind === "video"
          ? "Calling… (video)"
          : "Calling… (audio)"
        : phase === "connected"
          ? kind === "video"
            ? "Connected · video (demo)"
            : "Connected · audio (demo)"
          : "Call ended";

  const footer =
    phase === "pick" ? (
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
          disabled={!kind}
          onClick={startCall}
        >
          Start call
        </Button>
      </div>
    ) : phase === "calling" || phase === "connected" ? (
      <div className="flex w-full justify-end">
        <Button
          type="button"
          variant="outline"
          className="border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={endCall}
        >
          <PhoneOff className="mr-2 size-4" />
          End call
        </Button>
      </div>
    ) : (
      <div className="flex w-full justify-end">
        <Button
          type="button"
          className="bg-[#895129] hover:bg-[#7b4723]"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </div>
    );

  return (
    <DashboardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Call"
      description="Demo call flow (mock — no WebRTC session)."
      footer={footer}
    >
      <div className="space-y-4">
        <div
          className={cn(
            "rounded-xl border border-border/60 px-3 py-2 text-center text-sm",
            phase === "connected"
              ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
              : "bg-muted/30 text-muted-foreground",
          )}
        >
          {statusLabel}
        </div>

        {phase === "pick" ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setKind("audio")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition",
                kind === "audio"
                  ? "border-[#895129] bg-[#895129]/10 text-[#895129]"
                  : "border-border/60 hover:bg-muted/40",
              )}
            >
              <Mic className="size-4" />
              Audio
            </button>
            <button
              type="button"
              onClick={() => setKind("video")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition",
                kind === "video"
                  ? "border-[#895129] bg-[#895129]/10 text-[#895129]"
                  : "border-border/60 hover:bg-muted/40",
              )}
            >
              <Video className="size-4" />
              Video
            </button>
          </div>
        ) : (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
            {phase === "calling" ? (
              <span className="animate-pulse">Connecting…</span>
            ) : null}
            {phase === "connected" ? (
              <span>Mock stream · no media permissions requested</span>
            ) : null}
            {phase === "ended" ? <span>You left the call</span> : null}
          </div>
        )}
      </div>
    </DashboardModal>
  );
}
