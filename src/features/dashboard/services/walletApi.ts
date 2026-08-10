import { baseApi } from "@/services/baseApi";
import type { Wallet, WalletTransaction, WithdrawRequest } from "@/types/api";

export const walletApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWallet: build.query<Wallet, void>({
      query: () => "/wallets/mine",
      transformResponse: (response: { data: Wallet }) => response.data,
      providesTags: ["Wallet" as any],
    }),
    getTransactions: build.query<WalletTransaction[], void>({
      query: () => "/transactions/",
      transformResponse: (response: { data: WalletTransaction[] }) =>
        response.data,
      providesTags: ["Wallet" as any],
    }),
    getWithdrawRequests: build.query<WithdrawRequest[], void>({
      query: () => "/withdraw-requests/",
      transformResponse: (response: { data: WithdrawRequest[] }) =>
        response.data,
      providesTags: ["Wallet" as any],
    }),
    connectStripe: build.mutation<{ url: string }, void>({
      query: () => ({
        url: "/wallets/connect-stripe",
        method: "POST",
      }),
      transformResponse: (response: { data: { url: string } }) => response.data,
    }),
    createWithdrawRequest: build.mutation<void, { amount: number }>({
      query: (body) => ({
        url: "/withdraw-requests/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet" as any],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWalletQuery,
  useGetTransactionsQuery,
  useGetWithdrawRequestsQuery,
  useConnectStripeMutation,
  useCreateWithdrawRequestMutation,
} = walletApi;
