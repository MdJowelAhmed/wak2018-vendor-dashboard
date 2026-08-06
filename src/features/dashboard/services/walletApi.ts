import { baseApi } from '@/services/baseApi'
import type { Wallet, WalletTransaction } from '@/types/api'

export const walletApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWallet: build.query<Wallet, void>({
      query: () => '/wallets/mine',
      transformResponse: (response: { data: Wallet }) => response.data,
      providesTags: ['Wallet' as any],
    }),
    getTransactions: build.query<WalletTransaction[], void>({
      query: () => '/transactions/',
      transformResponse: (response: { data: WalletTransaction[] }) => response.data,
      providesTags: ['Wallet' as any],
    }),
  }),
  overrideExisting: false,
})

export const { useGetWalletQuery, useGetTransactionsQuery } = walletApi
