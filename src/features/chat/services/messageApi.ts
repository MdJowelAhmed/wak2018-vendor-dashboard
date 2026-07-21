import { baseApi } from '@/services/baseApi'
import type { Conversation, Message } from '@/types/api'

export const messageApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getConversations: build.query<Conversation[], void>({
      query: () => '/messages/conversations',
      providesTags: (r) =>
        r
          ? [
              { type: 'Conversation' as const, id: 'LIST' },
              ...r.map((c) => ({ type: 'Conversation' as const, id: c.id })),
            ]
          : [{ type: 'Conversation' as const, id: 'LIST' }],
    }),
    getMessages: build.query<Message[], string>({
      query: (conversationId) => `/messages/${conversationId}`,
      providesTags: (_r, _e, id) => [{ type: 'Message' as const, id }],
    }),
    sendMessage: build.mutation<
      Message,
      { conversationId: string; body: string }
    >({
      query: ({ conversationId, body }) => ({
        url: `/messages/${conversationId}`,
        method: 'POST',
        body: { body },
      }),
      invalidatesTags: (_r, _e, { conversationId }) => [
        { type: 'Message' as const, id: conversationId },
        { type: 'Conversation' as const, id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} = messageApi
