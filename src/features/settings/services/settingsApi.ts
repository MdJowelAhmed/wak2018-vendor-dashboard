import { baseApi } from '@/services/baseApi'

const tag = { type: 'Settings' as const, id: 'LEGAL' as const }

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTerms: build.query<{ content: string; updatedAt?: string }, void>({
      query: () => '/settings/terms',
      providesTags: [tag],
    }),
    getPrivacy: build.query<{ content: string; updatedAt?: string }, void>({
      query: () => '/settings/privacy',
      providesTags: [tag],
    }),
    sendSupportMessage: build.mutation<{ ok: true }, { subject: string; message: string }>({
      query: (body) => ({
        url: '/support/message',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
})

export const { useGetTermsQuery, useGetPrivacyQuery, useSendSupportMessageMutation } = settingsApi

