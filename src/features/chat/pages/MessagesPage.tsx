import { useMemo, useState } from "react";
import { ChatLayout } from "@/features/chat/components/ChatLayout";
import {
  ChatSidebar,
  type DummyConversation,
} from "@/features/chat/components/ChatSidebar";
import {
  ChatWindow,
  type DummyMessage,
} from "@/features/chat/components/ChatWindow";
import { ChatInput } from "@/features/chat/components/ChatInput";

export function MessagesPage() {
  const conversations: DummyConversation[] = useMemo(
    () => [
      {
        id: "c1",
        name: "Asha Rahman",
        context: "vendor",
        lastMessage: "Is the product still in stock?",
      },
      {
        id: "c2",
        name: "Mira K.",
        context: "service",
        lastMessage: "Can you share the requirements doc?",
      },
      {
        id: "c3",
        name: "Liam Hossain",
        context: "vendor",
        lastMessage: "What’s the ETA for delivery?",
      },
    ],
    [],
  );

  const [activeId, setActiveId] = useState<string | null>(
    conversations[0]?.id ?? null,
  );
  const [draft, setDraft] = useState("");

  const [messagesByConv, setMessagesByConv] = useState<
    Record<string, DummyMessage[]>
  >(() => ({
    c1: [
      {
        id: "m1",
        sender: "them",
        text: "Is the product still in stock?",
        createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
      {
        id: "m2",
        sender: "me",
        text: "Yes, it is. Ready to ship.",
        createdAt: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
      },
    ],
    c2: [
      {
        id: "m3",
        sender: "them",
        text: "Can you share the requirements doc?",
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
    ],
    c3: [
      {
        id: "m4",
        sender: "them",
        text: "What’s the ETA for delivery?",
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
    ],
  }));

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const activeMessages = useMemo(
    () => (activeId ? (messagesByConv[activeId] ?? []) : []),
    [messagesByConv, activeId],
  );

  function sendDummy() {
    if (!activeId || !draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    setMessagesByConv((prev) => ({
      ...prev,
      [activeId]: [
        ...(prev[activeId] ?? []),
        {
          id: `m-${Date.now()}`,
          sender: "me",
          text,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="text-muted-foreground text-sm">
          UI-only (dummy data). Socket + API will be added in the next steps.
        </p>
      </div>

      <ChatLayout
        sidebar={
          <ChatSidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={(id) => setActiveId(id)}
          />
        }
        window={
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <ChatWindow
              title={activeConversation?.name}
              messages={activeMessages}
            />
            <ChatInput
              value={draft}
              onChange={setDraft}
              onSend={sendDummy}
              disabled={!activeId}
            />
          </div>
        }
      />
    </div>
  );
}
