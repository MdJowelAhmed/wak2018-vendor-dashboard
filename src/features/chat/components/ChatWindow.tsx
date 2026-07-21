import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/utils";

export type DummyMessage = {
  id: string;
  sender: "me" | "them";
  text: string;
  createdAt: string;
};

export function ChatWindow({
  title,
  messages,
}: {
  title?: string;
  messages: DummyMessage[];
}) {
  return (
    <>
      {title ? (
        <p className="text-muted-foreground text-xs">Chatting with {title}</p>
      ) : null}
      <ScrollArea className="border-input flex-1 rounded-md border p-3">
        <div className="space-y-2 pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.sender === "me" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                  m.sender === "me" ? "bg-[#895129] text-white" : "bg-muted",
                )}
              >
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <div
                  className={cn(
                    "mt-1 text-[11px]",
                    m.sender === "me"
                      ? "text-white/80"
                      : "text-muted-foreground",
                  )}
                >
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
          {!messages.length ? (
            <p className="text-muted-foreground text-sm">No messages yet.</p>
          ) : null}
        </div>
      </ScrollArea>
    </>
  );
}
