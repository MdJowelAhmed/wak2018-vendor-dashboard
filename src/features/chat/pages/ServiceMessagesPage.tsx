import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Paperclip, Phone, Send, X } from "lucide-react";
import { toast } from "sonner";
import { CallModal } from "@/features/chat/components/CallModal";
import {
  ChatOfferMessage,
  type OfferBubble,
  type OfferStatus,
} from "@/features/chat/components/ChatOfferMessage";
import {
  SendOfferModal,
  type OfferFormValues,
} from "@/features/chat/components/SendOfferModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/utils";

type Conversation = {
  id: number;
  bookingId: string;
  customer: string;
  lastMessage: string;
  time: string;
  unread: number;
};

type ChatTextMessage = {
  id: number;
  sender: "customer" | "provider";
  time: string;
  variant?: "text";
  text: string;
  status?: "sent" | "delivered" | "seen";
  fileUrl?: string;
  fileType?: "image" | "file";
  fileName?: string;
};

type ChatOfferMessageRow = {
  id: number;
  sender: "customer" | "provider";
  time: string;
  variant: "offer";
  offer: OfferBubble;
};

type ChatMessage = ChatTextMessage | ChatOfferMessageRow;

type PendingAttachment = {
  id: string;
  fileUrl: string;
  fileType: "image" | "file";
  fileName: string;
};

const conversationsSeed: Conversation[] = [
  {
    id: 1,
    bookingId: "BK-2031",
    customer: "Mira K.",
    lastMessage: "Can you finish today?",
    time: "2 min ago",
    unread: 2,
  },
];

/** Service dashboard: signed-in user is always the provider in this demo. */
const VIEWER_ROLE: "provider" | "customer" = "provider";

const messagesSeed: Record<number, ChatMessage[]> = {
  1: [
    {
      id: 1,
      sender: "customer",
      text: "Hi, is this service available?",
      time: "10:00 AM",
      status: "seen",
    },
    {
      id: 2,
      sender: "provider",
      text: "Yes, I can help you.",
      time: "10:02 AM",
      status: "seen",
    },
    {
      id: 3,
      sender: "customer",
      text: "Can you finish today?",
      time: "10:05 AM",
      status: "delivered",
    },
  ],
};

export function MessagesPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] =
    useState<Conversation[]>(conversationsSeed);
  const [activeId, setActiveId] = useState<number | null>(
    conversationsSeed[0]?.id ?? null,
  );
  const [messagesByConvo, setMessagesByConvo] =
    useState<Record<number, ChatMessage[]>>(messagesSeed);
  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingAttachment[]>([]);
  const [typing, setTyping] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const attachRef = useRef<HTMLInputElement | null>(null);

  const active = useMemo(
    () =>
      activeId == null
        ? null
        : (conversations.find((c) => c.id === activeId) ?? null),
    [activeId, conversations],
  );
  const msgs = useMemo(
    () => (active ? (messagesByConvo[active.id] ?? []) : []),
    [active, messagesByConvo],
  );

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, msgs.length, typing]);

  function selectConversation(id: number) {
    setActiveId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
    setPendingFiles([]);
  }

  function onPickFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const next: PendingAttachment[] = Array.from(files).map((f) => {
      const isImage = f.type.startsWith("image/");
      return {
        id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        fileUrl: URL.createObjectURL(f),
        fileType: isImage ? "image" : "file",
        fileName: f.name,
      };
    });
    setPendingFiles((prev) => [...prev, ...next]);
  }

  function removePending(id: string) {
    setPendingFiles((prev) => prev.filter((p) => p.id !== id));
  }

  function sendOfferFromModal(values: OfferFormValues) {
    if (!active) return;
    const now = new Date();
    const time = now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    const offer: OfferBubble = {
      offerId: `off-${Date.now()}`,
      title: values.title,
      description: values.description,
      price: values.price,
      deliveryDays: values.deliveryDays,
      revisions: values.revisions,
      status: "pending",
    };
    const row: ChatOfferMessageRow = {
      id: Date.now(),
      sender: "provider",
      time,
      variant: "offer",
      offer,
    };
    setMessagesByConvo((prev) => ({
      ...prev,
      [active.id]: [...(prev[active.id] ?? []), row],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, lastMessage: `Offer: ${values.title}`, time: "just now" }
          : c,
      ),
    );
    toast.success("Offer sent");
  }

  function setOfferStatus(
    convoId: number,
    messageId: number,
    status: OfferStatus,
  ) {
    setMessagesByConvo((prev) => ({
      ...prev,
      [convoId]: (prev[convoId] ?? []).map((m) =>
        m.variant === "offer" && m.id === messageId
          ? { ...m, offer: { ...m.offer, status } }
          : m,
      ),
    }));
  }

  function withdrawOffer(
    convoId: number,
    messageId: number,
    offer: OfferBubble,
  ) {
    if (offer.status !== "pending") return;
    setOfferStatus(convoId, messageId, "withdrawn");
    toast.message("Offer withdrawn");
  }

  function acceptOffer(
    convoId: number,
    messageId: number,
    offer: OfferBubble,
    customerName: string,
  ) {
    if (offer.status !== "pending") return;
    setOfferStatus(convoId, messageId, "accepted");
    navigate("/service/bookings", {
      replace: false,
      state: {
        fromOffer: {
          offerId: offer.offerId,
          title: offer.title,
          customer: customerName,
          amount: offer.price,
        },
      },
    });
    toast.success("Offer accepted — new booking added");
  }

  function rejectOffer(convoId: number, messageId: number, offer: OfferBubble) {
    if (offer.status !== "pending") return;
    setOfferStatus(convoId, messageId, "rejected");
    toast.message("Offer declined");
  }

  function send() {
    if (!active) return;
    const text = draft.trim();
    const hasAttachments = pendingFiles.length > 0;
    if (!text && !hasAttachments) return;

    const now = new Date();
    const time = now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    const baseId = Date.now();

    const attachmentMessages: ChatTextMessage[] = pendingFiles.map(
      (p, idx) => ({
        id: baseId + idx,
        sender: "provider",
        text: idx === 0 ? text : "",
        time,
        status: "sent",
        fileUrl: p.fileUrl,
        fileType: p.fileType,
        fileName: p.fileName,
      }),
    );

    const nextMessages: ChatMessage[] = hasAttachments
      ? attachmentMessages
      : [
          {
            id: baseId,
            sender: "provider",
            text,
            time,
            status: "sent",
          } satisfies ChatTextMessage,
        ];

    setMessagesByConvo((prev) => ({
      ...prev,
      [active.id]: [...(prev[active.id] ?? []), ...nextMessages],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id ? { ...c, lastMessage: text, time: "just now" } : c,
      ),
    );

    setDraft("");
    setPendingFiles([]);

    // Optional UX: simulate customer typing + reply (static demo).
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      const reply: ChatTextMessage = {
        id: Date.now() + 1,
        sender: "customer",
        text: "Great, thanks!",
        time: new Date().toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "delivered",
      };
      setMessagesByConvo((prev) => ({
        ...prev,
        [active.id]: [...(prev[active.id] ?? []), reply],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === active.id
            ? { ...c, lastMessage: reply.text, time: "just now" }
            : c,
        ),
      );
    }, 900);
  }

  const offerDefaultTitle = active
    ? `Custom service · ${active.bookingId}`
    : "Custom service";

  return (
    <div className="w-full space-y-6 bg-[#FFFFFF]">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="text-muted-foreground text-sm">
          Chat with customers about bookings and service details.
        </p>
      </div>

      <CallModal open={callOpen} onOpenChange={setCallOpen} />
      <SendOfferModal
        open={offerOpen}
        onOpenChange={setOfferOpen}
        defaultTitle={offerDefaultTitle}
        onSend={sendOfferFromModal}
      />

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* LEFT: Conversations */}
        <Card className="min-h-[70svh] rounded-xl border-border/60 bg-[#FFFFFF] shadow-sm">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Customers and recent messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {conversations.length ? (
              conversations.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectConversation(c.id)}
                    className={cn(
                      "w-full rounded-xl border border-border/60 p-3 text-left transition",
                      isActive
                        ? "bg-[#895129]/5 border-[#895129]/30"
                        : "hover:bg-muted/30",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold truncate">
                            {c.customer}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {c.bookingId}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                          {c.lastMessage}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-muted-foreground text-xs">
                          {c.time}
                        </div>
                        {c.unread ? (
                          <div className="mt-1 inline-flex min-w-6 items-center justify-center rounded-full bg-[#895129] px-2 py-0.5 text-xs font-semibold text-white">
                            {c.unread}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-muted-foreground text-sm">
                No conversations yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: Chat */}
        <Card className="min-h-[70svh] rounded-xl border-border/60 bg-[#FFFFFF] shadow-sm">
          {active ? (
            <>
              <CardHeader className="border-b border-border/60 bg-[#FFFFFF]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate leading-tight">
                      {active.customer}
                    </CardTitle>
                    <CardDescription className="mt-0.5 leading-normal">
                      Booking: {active.bookingId}
                    </CardDescription>
                  </div>
                  <div className="flex flex-row flex-wrap items-center gap-2.5 sm:gap-3 sm:shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      aria-label="Call"
                      className="h-10 min-h-10 shrink-0 border-[#895129]/35 px-3.5 text-sm leading-none text-[#895129] hover:bg-[#895129]/10"
                      onClick={() => setCallOpen(true)}
                    >
                      <Phone className="size-4 shrink-0" />
                      <span className="hidden sm:inline">Call</span>
                    </Button>
                    <Button
                      type="button"
                      aria-label="Send offer"
                      className="h-10 min-h-10 shrink-0 bg-[#895129] px-3.5 text-sm leading-none hover:bg-[#7b4723]"
                      onClick={() => setOfferOpen(true)}
                    >
                      <Send className="size-4 shrink-0" />
                      <span className="hidden sm:inline">Send Offer</span>
                    </Button>
                    <Badge
                      variant="outline"
                      className="h-10 min-h-10 shrink-0 rounded-full border-emerald-200 bg-emerald-50 px-3 py-0 text-xs font-medium leading-none text-emerald-700"
                    >
                      Online
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex h-[calc(70svh-7.25rem)] flex-col">
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="space-y-3">
                    {msgs.map((m) => {
                      if (m.variant === "offer") {
                        const mine = m.sender === "provider";
                        const isSenderView = m.sender === VIEWER_ROLE;
                        return (
                          <ChatOfferMessage
                            key={m.id}
                            mine={mine}
                            time={m.time}
                            offer={m.offer}
                            isSenderView={isSenderView}
                            onAccept={() =>
                              acceptOffer(
                                active.id,
                                m.id,
                                m.offer,
                                active.customer,
                              )
                            }
                            onReject={() =>
                              rejectOffer(active.id, m.id, m.offer)
                            }
                            onWithdraw={() =>
                              withdrawOffer(active.id, m.id, m.offer)
                            }
                          />
                        );
                      }
                      const mine = m.sender === "provider";
                      return (
                        <div
                          key={m.id}
                          className={cn(
                            "flex",
                            mine ? "justify-end" : "justify-start",
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[78%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                              mine
                                ? "bg-[#895129] text-white"
                                : "bg-muted text-foreground",
                            )}
                          >
                            {m.text ? (
                              <div className="whitespace-pre-wrap">
                                {m.text}
                              </div>
                            ) : null}
                            {m.fileUrl && m.fileType === "image" ? (
                              <div className={cn(m.text ? "mt-2" : "")}>
                                <img
                                  src={m.fileUrl}
                                  alt={m.fileName ?? "attachment"}
                                  className="h-auto w-[200px] max-w-full rounded-xl object-cover"
                                />
                              </div>
                            ) : null}
                            {m.fileUrl && m.fileType === "file" ? (
                              <a
                                href={m.fileUrl}
                                download={m.fileName ?? undefined}
                                className={cn(
                                  "mt-2 inline-flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-sm",
                                  mine
                                    ? "bg-white/10 text-white hover:bg-white/15"
                                    : "bg-background/60 hover:bg-background",
                                )}
                              >
                                <FileText
                                  className={cn(
                                    "size-4",
                                    mine
                                      ? "text-white/90"
                                      : "text-muted-foreground",
                                  )}
                                />
                                <span className="truncate max-w-[220px]">
                                  {m.fileName ?? "Attachment"}
                                </span>
                              </a>
                            ) : null}
                            <div
                              className={cn(
                                "mt-1 flex items-center justify-end gap-2 text-[11px]",
                                mine
                                  ? "text-white/80"
                                  : "text-muted-foreground",
                              )}
                            >
                              <span>{m.time}</span>
                              {mine && m.status ? (
                                <span className="opacity-80">{m.status}</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {typing ? (
                      <div className="flex justify-start">
                        <div className="bg-muted text-muted-foreground rounded-2xl px-4 py-2 text-sm">
                          Typing…
                        </div>
                      </div>
                    ) : null}

                    <div ref={endRef} />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <input
                    ref={attachRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      onPickFiles(e.currentTarget.files);
                      e.currentTarget.value = "";
                    }}
                  />
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder="Type a message…"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => attachRef.current?.click()}
                    aria-label="Attach file"
                  >
                    <Paperclip className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    className="bg-[#895129] hover:bg-[#7b4723]"
                    onClick={send}
                    disabled={!draft.trim() && pendingFiles.length === 0}
                  >
                    Send
                  </Button>
                </div>

                {pendingFiles.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {pendingFiles.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-2 py-1.5"
                      >
                        {p.fileType === "image" ? (
                          <img
                            src={p.fileUrl}
                            alt={p.fileName}
                            className="size-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="bg-background/60 flex size-10 items-center justify-center rounded-lg border border-border/60">
                            <FileText className="size-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="max-w-[180px] truncate text-xs font-medium">
                          {p.fileName}
                        </div>
                        <button
                          type="button"
                          className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                          onClick={() => removePending(p.id)}
                          aria-label="Remove attachment"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </>
          ) : (
            <div className="flex min-h-[70svh] items-center justify-center px-6 text-center text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
