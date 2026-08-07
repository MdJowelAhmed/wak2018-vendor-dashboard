import { useEffect, useRef, useState } from "react";
import { baseApi } from "@/services/baseApi";
import { useAppDispatch } from "@/app/hooks";
import { getSocket } from "@/utils/socket";

export function useChatRealtime(conversationId?: string) {
  const dispatch = useAppDispatch();
  const [peerTyping, setPeerTyping] = useState(false);
  const t = useRef<number | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !conversationId) return;

    const invalidate = () => {
      dispatch(
        baseApi.util.invalidateTags([
          { type: "Messages", id: conversationId },
          { type: "Conversations", id: "LIST" },
        ]),
      );
    };

    const onReceive = (p: { conversationId?: string }) => {
      if (p?.conversationId !== conversationId) return;
      invalidate();
    };
    const onTyping = (p: { conversationId?: string }) => {
      if (p?.conversationId !== conversationId) return;
      setPeerTyping(true);
      if (t.current) window.clearTimeout(t.current);
      t.current = window.setTimeout(() => setPeerTyping(false), 1200);
    };
    const onSeen = (p: { conversationId?: string }) => {
      if (p?.conversationId !== conversationId) return;
      invalidate();
    };

    socket.on("receive_message", onReceive);
    socket.on("typing", onTyping);
    socket.on("seen", onSeen);

    return () => {
      socket.off("receive_message", onReceive);
      socket.off("typing", onTyping);
      socket.off("seen", onSeen);
      if (t.current) window.clearTimeout(t.current);
    };
  }, [conversationId, dispatch]);

  return { peerTyping };
}
