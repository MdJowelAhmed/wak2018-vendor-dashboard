import { baseApi } from '@/services/baseApi'
import type { CustomerDetails, CustomerListRow } from '@/types/api'

const tag = { type: 'Customer' as const, id: 'DETAIL' as const }

export const customerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query<CustomerListRow[], void>({
      query: () => '/vendor/customers',
      providesTags: [tag],
    }),
    getCustomerDetails: build.query<CustomerDetails, string>({
      query: (id) => `/vendor/customers/${id}`,
      providesTags: (_r, _e, id) => [tag, { type: 'Customer' as const, id }],
    }),
  }),
  overrideExisting: false,
})

export const { useGetCustomersQuery, useGetCustomerDetailsQuery } = customerApi

