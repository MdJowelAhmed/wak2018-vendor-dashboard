import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Paperclip, Send, X } from "lucide-react";
import { toast } from "sonner";
import { SendOfferModal } from "@/features/chat/components/SendOfferModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useChatRealtime } from "@/features/chat/hooks/useChatRealtime";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, getImageUrl } from "@/utils/utils";
import {
  useGetChatsQuery,
  useGetChatMessagesQuery,
  useSendMessageMutation,
} from "@/features/chat/services/messageApi";
import { useGetUserProfileQuery } from "@/services/profileApi";
import type { ChatMessage as APIMessage } from "@/types/api";

type PendingAttachment = {
  id: string;
  fileUrl: string;
  fileType: "image" | "file";
  fileName: string;
  rawFile: File;
};

export function MessagesPage() {
  const { data: profileRes } = useGetUserProfileQuery();
  const sessionUser = profileRes?.data;

  const { data: chats = [], isLoading: isLoadingChats } =
    useGetChatsQuery("service provider", {
      pollingInterval: 4000,
    });
  const [activeId, setActiveId] = useState<string | null>(null);

  // Automatically select the first chat if none is selected
  useEffect(() => {
    if (!activeId && chats.length > 0) {
      setActiveId(chats[0]._id);
    }
  }, [chats, activeId]);

  const { data: messages = [], isLoading: isLoadingMessages } =
    useGetChatMessagesQuery(activeId!, {
      skip: !activeId,
      pollingInterval: 3000,
    });

  useChatRealtime(activeId || undefined);

  const [sendMessageMutation, { isLoading: isSending }] =
    useSendMessageMutation();

  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingAttachment[]>([]);
  const [offerOpen, setOfferOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const attachRef = useRef<HTMLInputElement | null>(null);

  const active = useMemo(
    () =>
      activeId == null ? null : (chats.find((c) => c._id === activeId) ?? null),
    [activeId, chats],
  );

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [activeId, messages, pendingFiles.length, isSending]);

  function selectConversation(id: string) {
    setActiveId(id);
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
        rawFile: f,
      };
    });
    setPendingFiles((prev) => [...prev, ...next]);
  }

  function removePending(id: string) {
    setPendingFiles((prev) => prev.filter((p) => p.id !== id));
  }

  function sendOfferFromModal() {
    // Left empty for now, as offer messages are custom to the UI
    toast.success("Offers feature coming soon to real API!");
  }

  async function send() {
    if (!active) return;
    const text = draft.trim();
    const hasAttachments = pendingFiles.length > 0;
    if (!text && !hasAttachments) return;

    try {
      if (hasAttachments) {
        // Send files
        for (const file of pendingFiles) {
          const formData = new FormData();
          formData.append("chat", active._id);
          formData.append("type", file.fileType);
          if (file.fileType === "image") {
            formData.append("image", file.rawFile);
          } else {
            formData.append("doc", file.rawFile);
          }

          // Attach text only to the first message if there are multiple files
          if (file === pendingFiles[0] && text) {
            formData.append("text", text);
          } else {
            formData.append("text", "");
          }
          await sendMessageMutation(formData).unwrap();
        }
      } else {
        // Send text only
        const formData = new FormData();
        formData.append("chat", active._id);
        formData.append("type", "text");
        formData.append("text", text);
        await sendMessageMutation(formData).unwrap();
      }

      setDraft("");
      setPendingFiles([]);
    } catch (err) {
      toast.error("Failed to send message");
    }
  }

  const offerDefaultTitle = active ? `Custom service` : "Custom service";

  function getOtherParticipantName(chat: any) {
    const p = chat.anotherParticipant || chat.participants?.[0];
    return p?.name || "Customer";
  }

  return (
    <div className="w-full space-y-6 bg-[#FFFFFF]">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="text-muted-foreground text-sm">
          Chat with customers about bookings and service details.
        </p>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:scale-105 hover:bg-white/20"
            aria-label="Close image preview"
          >
            <X className="size-6" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="h-full w-full object-contain p-4 sm:p-12"
          />
        </div>
      )}

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
            {isLoadingChats ? (
              <div className="text-muted-foreground text-sm">
                Loading chats...
              </div>
            ) : chats.length ? (
              chats.map((c) => {
                const isActive = c._id === activeId;
                const name = getOtherParticipantName(c);
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => selectConversation(c._id)}
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
                          <div className="font-semibold truncate">{name}</div>
                        </div>
                        <div className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                          {c.lastMessage?.text ||
                            (c.lastMessage?.attachment
                              ? "Sent an attachment"
                              : "New chat started")}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        {c.unreadCount ? (
                          <div className="mt-1 inline-flex min-w-6 items-center justify-center rounded-full bg-[#895129] px-2 py-0.5 text-xs font-semibold text-white">
                            {c.unreadCount}
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
                      {getOtherParticipantName(active)}
                    </CardTitle>
                  </div>
                  <div className="flex flex-row flex-wrap items-center gap-2.5 sm:gap-3 sm:shrink-0">
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
                    {isLoadingMessages ? (
                      <div className="text-muted-foreground text-sm text-center pt-4">
                        Loading messages...
                      </div>
                    ) : (
                      [...messages].reverse().map((m: APIMessage) => {
                        const mine =
                          typeof m.sender === "object"
                            ? m.sender?._id === sessionUser?._id
                            : m.sender === sessionUser?._id;
                        const timeString = new Date(
                          m.createdAt,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <div
                            key={m._id}
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
                              {m.attachment && m.type === "image" ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewImage(getImageUrl(m.attachment))
                                  }
                                  className={cn(
                                    "block text-left",
                                    m.text ? "mt-2" : "",
                                  )}
                                >
                                  <img
                                    src={getImageUrl(m.attachment)}
                                    alt={"attachment"}
                                    className="h-auto w-[200px] max-w-full rounded-xl object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                  />
                                </button>
                              ) : null}
                              {m.attachment && m.type === "file" ? (
                                <a
                                  href={getImageUrl(m.attachment)}
                                  target="_blank"
                                  rel="noreferrer"
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
                                    Document File
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
                                <span>{timeString}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {isSending ? (
                      <div className="flex justify-end">
                        <div className="bg-[#895129]/60 text-white rounded-2xl px-4 py-2 text-sm">
                          Sending...
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
                    disabled={
                      (!draft.trim() && pendingFiles.length === 0) || isSending
                    }
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
