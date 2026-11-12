import { baseApi } from "@/services/baseApi";

export type VerificationStatus = "pending" | "approved" | "rejected";
export type VerificationType = "vendor" | "rider";

export type VerificationDocument = {
  type: string;
  key?: string;
  url: string;
};

export type VerificationUser = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  businessName?: string;
};

export type VerificationRequest = {
  _id: string;
  type: VerificationType | string;
  status: VerificationStatus | string;
  documents?: VerificationDocument[];
  user?: VerificationUser | string;
  createdAt?: string;
  updatedAt?: string;
};

export type VerificationListResponse = {
  data: VerificationRequest[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
};

const listTag = {
  type: "VerificationRequests" as const,
  id: "LIST" as const,
};

export const verificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getVerificationRequests: build.query<
      VerificationListResponse,
      {
        status?: VerificationStatus;
        type?: VerificationType;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (q) => ({
        url: "/verification-requests",
        params: {
          status: q?.status || undefined,
          type: q?.type || undefined,
          page: q?.page,
          limit: q?.limit,
        },
      }),
      transformResponse: (response: any): VerificationListResponse => {
        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : [];
        const pagination =
          response?.pagination ?? response?.data?.pagination ?? undefined;
        return { data, pagination };
      },
      providesTags: (result) =>
        result?.data
          ? [
              listTag,
              ...result.data.map((item) => ({
                type: "VerificationRequests" as const,
                id: item._id,
              })),
            ]
          : [listTag],
    }),
    getVerificationRequest: build.query<VerificationRequest, string>({
      query: (id) => `/verification-requests/${id}`,
      transformResponse: (response: any) =>
        (response?.data ?? response) as VerificationRequest,
      providesTags: (_r, _e, id) => [{ type: "VerificationRequests", id }],
    }),
    updateVerificationStatus: build.mutation<
      VerificationRequest,
      { id: string; status: "approved" | "rejected" }
    >({
      query: ({ id, status }) => ({
        url: `/verification-requests/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        listTag,
        { type: "VerificationRequests", id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVerificationRequestsQuery,
  useGetVerificationRequestQuery,
  useUpdateVerificationStatusMutation,
} = verificationApi;
