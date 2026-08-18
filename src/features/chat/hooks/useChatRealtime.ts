import { useEffect, useRef, useState } from "react";
import { baseApi } from "@/services/baseApi";
import { useAppDispatch } from "@/app/hooks";
import { connectSocket, getSocket } from "@/utils/socket";
import { messageApi } from "@/features/chat/services/messageApi";

export function useChatRealtime(conversationId?: string) {
  const dispatch = useAppDispatch();
  const [peerTyping, setPeerTyping] = useState(false);
  const t = useRef<number | null>(null);

  useEffect(() => {
    const socket = getSocket() ?? connectSocket();
    if (!socket) return;

    if (conversationId) {
      socket.emit("join_chat", conversationId);
      socket.emit("join_room", conversationId);
      socket.emit("join", conversationId);
      socket.emit("joinChat", conversationId);
    }

    const invalidate = (targetChatId?: string) => {
      const cid = targetChatId || conversationId;
      
      dispatch(
        baseApi.util.invalidateTags([
          { type: "Conversations", id: "LIST" },
          ...(cid ? [{ type: "Messages" as const, id: cid }] : []),
        ]),
      );

      // Force immediate RTK Query refetch for active chat & conversations list
      if (cid) {
        dispatch(
          messageApi.endpoints.getChatMessages.initiate(cid, {
            subscribe: false,
            forceRefetch: true,
          }),
        );
      }
      dispatch(
        messageApi.endpoints.getChats.initiate("", {
          subscribe: false,
          forceRefetch: true,
        }),
      );
    };

    const onReceive = (p: any) => {
      console.log("Realtime chat message event received:", p);
      const id =
        p?.conversationId ||
        p?.chat ||
        p?.chatId ||
        p?.message?.chat ||
        p?.data?.chat ||
        p?.data?.conversationId ||
        (typeof p === "string" ? p : undefined);

      invalidate(id);
    };

    const onTyping = (p: any) => {
      const id =
        p?.conversationId ||
        p?.chat ||
        p?.chatId ||
        p?.message?.chat ||
        p?.data?.chat;
      if (conversationId && id && id !== conversationId) return;
      setPeerTyping(true);
      if (t.current) window.clearTimeout(t.current);
      t.current = window.setTimeout(() => setPeerTyping(false), 1200);
    };

    const onSeen = (p: any) => {
      const id =
        p?.conversationId ||
        p?.chat ||
        p?.chatId ||
        p?.message?.chat ||
        p?.data?.chat;
      invalidate(id);
    };

    const receiveEvents = [
      "message:new",
      "receive_message",
      "new_message",
      "message:received",
      "message",
      "chat:message",
      "chat:new",
    ];

    receiveEvents.forEach((evt) => socket.on(evt, onReceive));
    socket.on("typing", onTyping);
    socket.on("seen", onSeen);

    return () => {
      receiveEvents.forEach((evt) => socket.off(evt, onReceive));
      socket.off("typing", onTyping);
      socket.off("seen", onSeen);
      if (t.current) window.clearTimeout(t.current);
    };
  }, [conversationId, dispatch]);

  return { peerTyping };
}
