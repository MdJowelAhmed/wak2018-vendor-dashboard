import { baseApi } from '@/services/baseApi'
import type { ProductOrder, ProductOrderStatus, ServiceOrder, ServiceOrderStatus } from '@/types/api'

const list = { type: 'Orders' as const, id: 'LIST' as const }

export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProductOrders: build.query<ProductOrder[], { status?: ProductOrderStatus } | void>({
      query: (q) => ({
        url: '/orders/products',
        params: q && q.status ? { status: q.status } : undefined,
      }),
      providesTags: (r) => (r ? [list, ...r.map((o) => ({ type: 'Orders' as const, id: o.id }))] : [list]),
    }),
    getServiceOrders: build.query<ServiceOrder[], { status?: ServiceOrderStatus } | void>({
      query: (q) => ({
        url: '/orders/services',
        params: q && q.status ? { status: q.status } : undefined,
      }),
      providesTags: (r) => (r ? [list, ...r.map((o) => ({ type: 'Orders' as const, id: o.id }))] : [list]),
    }),
    getOrderById: build.query<ProductOrder | ServiceOrder, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Orders', id }],
    }),
    updateProductOrderStatus: build.mutation<
      ProductOrder,
      { id: string; status: ProductOrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `/orders/products/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [list, { type: 'Orders' as const, id }],
    }),
    updateServiceOrderStatus: build.mutation<
      ServiceOrder,
      { id: string; status: ServiceOrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `/orders/services/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [list, { type: 'Orders' as const, id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetProductOrdersQuery,
  useGetServiceOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateProductOrderStatusMutation,
  useUpdateServiceOrderStatusMutation,
} = orderApi
