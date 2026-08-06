import { baseApi } from '@/services/baseApi'
import type { Conversation, Message } from '@/types/api'

export const messageApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getConversations: build.query<Conversation[], void>({
      query: () => '/messages/conversations',
      providesTags: (r) =>
        r
          ? [
              { type: 'Conversations' as const, id: 'LIST' },
              ...r.map((c) => ({ type: 'Conversations' as const, id: c.id })),
            ]
          : [{ type: 'Conversations' as const, id: 'LIST' }],
    }),
    getMessages: build.query<Message[], string>({
      query: (conversationId) => `/messages/${conversationId}`,
      providesTags: (_r, _e, id) => [{ type: 'Messages' as const, id }],
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
        { type: 'Messages' as const, id: conversationId },
        { type: 'Conversations' as const, id: 'LIST' },
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
