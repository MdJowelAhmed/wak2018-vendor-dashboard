import { baseApi } from "@/services/baseApi";

const tag = { type: "Settings" as const, id: "LEGAL" as const };

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTerms: build.query<{ content: string; updatedAt?: string }, void>({
      query: () => "/disclaimers/terms-and-conditions",
      providesTags: [tag],
      transformResponse: (res: any) => res?.data,
    }),
    getPrivacy: build.query<{ content: string; updatedAt?: string }, void>({
      query: () => "/disclaimers/privacy-policy",
      providesTags: [tag],
      transformResponse: (res: any) => res?.data,
    }),
    sendSupportMessage: build.mutation<
      { ok: true },
      { name: string; email: string; subject: string; message: string }
    >({
      query: (body) => ({
        url: "/contact/",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTermsQuery,
  useGetPrivacyQuery,
  useSendSupportMessageMutation,
} = settingsApi;
