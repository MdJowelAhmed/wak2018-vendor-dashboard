import { baseApi } from '@/services/baseApi'
import type { Delivery, DeliveryDriverStatus } from '@/types/api'

const listTag = { type: 'Delivery' as const, id: 'LIST' as const }

export type CreateDeliveryRequestBody = {
  order_id: string
  type?: 'local'
  pickup_location: string
  drop_location: string
  vendor_id: string
}

export type CreateInternationalShipmentBody = {
  order_id: string
  type: 'international'
  courier: 'dhl' | 'fedex' | 'ups'
  weight: number
  dimensions: string
  pickup_location: string
  drop_location: string
  vendor_id: string
}

export const deliveryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDeliveryRequests: build.query<Delivery[], void>({
      query: () => '/vendor/deliveries',
      providesTags: (r) =>
        r
          ? [listTag, ...r.map((d) => ({ type: 'Delivery' as const, id: d.id }))]
          : [listTag],
    }),
    getDriverQueue: build.query<Delivery[], void>({
      query: () => '/driver/deliveries',
      providesTags: (r) =>
        r
          ? [listTag, ...r.map((d) => ({ type: 'Delivery' as const, id: d.id }))]
          : [listTag],
    }),
    requestLocalDelivery: build.mutation<Delivery, CreateDeliveryRequestBody>({
      query: (body) => ({
        url: '/delivery/request',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result) => {
        if (result) {
          return [listTag, { type: 'Order' as const, id: result.orderId }, { type: 'Order' as const, id: 'LIST' }]
        }
        return [listTag, { type: 'Order' as const, id: 'LIST' }]
      },
    }),
    createInternationalShipment: build.mutation<Delivery, CreateInternationalShipmentBody>({
      query: (body) => ({
        url: '/delivery/international',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result) => {
        if (result) {
          return [listTag, { type: 'Order' as const, id: result.orderId }, { type: 'Order' as const, id: 'LIST' }]
        }
        return [listTag, { type: 'Order' as const, id: 'LIST' }]
      },
    }),
    getDeliveryStatus: build.query<Delivery | null, { orderId: string }>({
      query: ({ orderId }) => `/delivery/by-order/${orderId}`,
      providesTags: (_r, _e, arg) => [{ type: 'Delivery' as const, id: arg.orderId }],
    }),
    updateDeliveryStatus: build.mutation<
      Delivery,
      { id: string; driverStatus: DeliveryDriverStatus; deliveryStatus?: DeliveryDriverStatus }
    >({
      query: ({ id, driverStatus, deliveryStatus }) => ({
        url: `/delivery/${id}/status`,
        method: 'PATCH',
        body: { driverStatus, deliveryStatus: deliveryStatus ?? driverStatus },
      }),
      invalidatesTags: (_r, _e, { id }) => [listTag, { type: 'Delivery' as const, id }, { type: 'Order' as const, id: 'LIST' }],
    }),
    rejectDelivery: build.mutation<void, string>({
      query: (id) => ({ url: `/delivery/${id}/reject`, method: 'POST' }),
      invalidatesTags: [listTag, { type: 'Order' as const, id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetDeliveryRequestsQuery,
  useGetDriverQueueQuery,
  useRequestLocalDeliveryMutation,
  useCreateInternationalShipmentMutation,
  useGetDeliveryStatusQuery,
  useUpdateDeliveryStatusMutation,
  useRejectDeliveryMutation,
} = deliveryApi

// Backwards-compatible alias for existing UI.
export const useCreateDeliveryRequestMutation = useRequestLocalDeliveryMutation
