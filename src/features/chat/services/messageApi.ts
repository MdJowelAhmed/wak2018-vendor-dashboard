import { baseApi } from "@/services/baseApi";
import type { Chat, ChatMessage } from "@/types/api";

type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
  data: T;
};

type SingleResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const messageApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getChats: build.query<Chat[], string | void>({
      query: (searchTerm) =>
        searchTerm && typeof searchTerm === "string" && searchTerm.trim()
          ? `/chats/mine?searchTerm=${encodeURIComponent(searchTerm.trim())}`
          : "/chats/mine",
      transformResponse: (response: PaginatedResponse<Chat[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              { type: "Conversations" as const, id: "LIST" },
              ...result.map((c) => ({
                type: "Conversations" as const,
                id: c._id,
              })),
            ]
          : [{ type: "Conversations" as const, id: "LIST" }],
    }),
    getChatMessages: build.query<ChatMessage[], string>({
      query: (chatId) => `/messages/chats/${chatId}`,
      transformResponse: (response: PaginatedResponse<ChatMessage[]>) =>
        response.data,
      providesTags: (_r, _e, id) => [{ type: "Messages" as const, id }],
    }),
    createChat: build.mutation<Chat, { participants: string[] }>({
      query: (body) => ({
        url: `/chats/`,
        method: "POST",
        body,
      }),
      transformResponse: (response: SingleResponse<Chat>) => response.data,
      invalidatesTags: [{ type: "Conversations" as const, id: "LIST" }],
    }),
    sendMessage: build.mutation<ChatMessage, FormData>({
      query: (body) => ({
        url: `/messages/`,
        method: "POST",
        body,
      }),
      transformResponse: (response: SingleResponse<ChatMessage>) =>
        response.data,
      invalidatesTags: (_r, _e, formData) => {
        const chatId = formData.get("chat") as string;
        return [
          { type: "Messages" as const, id: chatId },
          { type: "Conversations" as const, id: "LIST" },
        ];
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetChatsQuery,
  useGetChatMessagesQuery,
  useCreateChatMutation,
  useSendMessageMutation,
} = messageApi;
