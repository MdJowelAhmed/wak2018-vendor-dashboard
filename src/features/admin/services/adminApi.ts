import { baseApi } from '@/services/baseApi'
import type { AdminUser, Delivery, Order, Product, Service } from '@/types/api'

const list = (t: string) => ({ type: t as any, id: 'LIST' as const })

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<AdminUser[], void>({
      query: () => '/admin/users',
      providesTags: (r) => (r ? [list('User'), ...r.map((u) => ({ type: 'User' as const, id: u.id }))] : [list('User')]),
    }),
    updateUserStatus: build.mutation<AdminUser, { id: string; status: AdminUser['status'] }>({
      query: ({ id, status }) => ({ url: `/admin/users/${id}/status`, method: 'PUT', body: { status } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User' as const, id }, list('User')],
    }),
    getAllOrders: build.query<Order[], void>({
      query: () => '/admin/orders',
      providesTags: [list('Order')],
    }),
    getAllProducts: build.query<Product[], void>({
      query: () => '/admin/products',
      providesTags: [list('Product')],
    }),
    getAllServices: build.query<Service[], void>({
      query: () => '/admin/services',
      providesTags: [list('Service')],
    }),
    getAllDeliveries: build.query<Delivery[], void>({
      query: () => '/admin/deliveries',
      providesTags: [list('Delivery')],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useGetAllOrdersQuery,
  useGetAllProductsQuery,
  useGetAllServicesQuery,
  useGetAllDeliveriesQuery,
} = adminApi

