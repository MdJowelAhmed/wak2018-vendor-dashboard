import { baseApi } from '@/services/baseApi'
import type { Wallet } from '@/types/api'

export const walletApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWallet: build.query<Wallet, void>({
      query: () => '/wallets/mine',
      transformResponse: (response: { data: Wallet }) => response.data,
      providesTags: ['Wallet' as any],
    }),
  }),
  overrideExisting: false,
})

export const { useGetWalletQuery } = walletApi
