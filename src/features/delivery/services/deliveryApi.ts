import { baseApi } from "@/services/baseApi";
import type { Delivery, DeliveryDriverStatus } from "@/types/api";

const listTag = { type: "Deliveries" as const, id: "LIST" as const };

export type CreateDeliveryRequestBody = {
  order_id: string;
  type?: "local";
  pickup_location: string;
  drop_location: string;
  vendor_id: string;
};

export type CreateInternationalShipmentBody = {
  order_id: string;
  type: "international";
  courier: "dhl" | "fedex" | "ups";
  weight: number;
  dimensions: string;
  pickup_location: string;
  drop_location: string;
  vendor_id: string;
};

function mapDeliveryData(d: any): Delivery {
  const isLocal = d.deliveryType === "local";
  const deliveryData = isLocal ? d.localDelivery : d.shipment;

  return {
    ...d,
    id: d._id,
    type: d.deliveryType,
    orderId: d.orderId,
    vendorId: d.vendor?._id || "",
    orderCustomerName: d.customer?.name || d.shippingAddress?.fullName || "",
    orderCustomerEmail: d.customer?.email || "",
    orderCustomerPhone: d.customer?.phone || d.shippingAddress?.phone || "",
    orderLineItemName: d.items?.[0]?.product?.name || "Multiple items",

    pickupLocation: isLocal
      ? d.localDelivery?.pickup?.address
      : d.shipment?.pickup?.address,
    dropLocation: isLocal
      ? d.localDelivery?.dropoff?.address
      : d.shipment?.dropoff?.address,
    deliveryFee: deliveryData?.deliveryFee || 0,
    deliveryPaid: deliveryData?.paymentStatus === "paid",
    paymentMethod: deliveryData?.paymentMethod || "Unknown",

    driverName: deliveryData?.assignedRider?.name || undefined,
    driverPhone: deliveryData?.assignedRider?.phone || undefined,
    driverStatus: deliveryData?.status || "requested",
    deliveryStatus: deliveryData?.status || "requested",

    courier: d.shipment?.courier,
    trackingId: d.shipment?.trackingId,
    trackingStatus: d.shipment?.trackingStatus,

    customerNote: d.customerNote,
    deliveryInstructions: d.deliveryInstructions,
    createdAt: d.createdAt,
  };
}

export const deliveryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDeliveryRequests: build.query<
      Delivery[],
      { searchTerm?: string; status?: string } | void
    >({
      query: (arg) => {
        const params: Record<string, any> = {};
        if (arg?.searchTerm) params.searchTerm = arg.searchTerm;
        if (arg?.status) params.status = arg.status;
        return {
          url: "/vendors/delivery-requests/",
          params,
        };
      },
      transformResponse: (res: any) => {
        const data = res?.data || [];
        return data.map(mapDeliveryData);
      },
      providesTags: (r) =>
        r
          ? [
              listTag,
              ...r.map((d) => ({ type: "Deliveries" as const, id: d.id })),
            ]
          : [listTag],
    }),
    getDeliveryRequestById: build.query<Delivery, string>({
      query: (id) => `/vendors/delivery-requests/${id}`,
      transformResponse: (res: any) => {
        const d = res?.data || {};
        return mapDeliveryData(d);
      },
      providesTags: (_result, _error, id) => [
        { type: "Deliveries" as const, id },
      ],
    }),
    getDriverQueue: build.query<Delivery[], void>({
      query: () => "/driver/deliveries",
      providesTags: (r) =>
        r
          ? [
              listTag,
              ...r.map((d) => ({ type: "Deliveries" as const, id: d.id })),
            ]
          : [listTag],
    }),
    requestLocalDelivery: build.mutation<Delivery, CreateDeliveryRequestBody>({
      query: (body) => ({
        url: "/delivery/request",
        method: "POST",
        body,
      }),
      invalidatesTags: (result) => {
        if (result) {
          return [
            listTag,
            { type: "Orders" as const, id: result.orderId },
            { type: "Orders" as const, id: "LIST" },
          ];
        }
        return [listTag, { type: "Orders" as const, id: "LIST" }];
      },
    }),
    createInternationalShipment: build.mutation<
      Delivery,
      CreateInternationalShipmentBody
    >({
      query: (body) => ({
        url: "/delivery/international",
        method: "POST",
        body,
      }),
      invalidatesTags: (result) => {
        if (result) {
          return [
            listTag,
            { type: "Orders" as const, id: result.orderId },
            { type: "Orders" as const, id: "LIST" },
          ];
        }
        return [listTag, { type: "Orders" as const, id: "LIST" }];
      },
    }),
    getDeliveryStatus: build.query<Delivery | null, { orderId: string }>({
      query: ({ orderId }) => `/delivery/by-order/${orderId}`,
      providesTags: (_r, _e, arg) => [
        { type: "Deliveries" as const, id: arg.orderId },
      ],
    }),
    updateDeliveryStatus: build.mutation<
      Delivery,
      {
        id: string;
        driverStatus: DeliveryDriverStatus;
        deliveryStatus?: DeliveryDriverStatus;
      }
    >({
      query: ({ id, driverStatus, deliveryStatus }) => ({
        url: `/delivery/${id}/status`,
        method: "PATCH",
        body: { driverStatus, deliveryStatus: deliveryStatus ?? driverStatus },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        listTag,
        { type: "Deliveries" as const, id },
        { type: "Orders" as const, id: "LIST" },
      ],
    }),
    rejectDelivery: build.mutation<void, string>({
      query: (id) => ({ url: `/delivery/${id}/reject`, method: "POST" }),
      invalidatesTags: [listTag, { type: "Orders" as const, id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDeliveryRequestsQuery,
  useGetDeliveryRequestByIdQuery,
  useGetDriverQueueQuery,
  useRequestLocalDeliveryMutation,
  useCreateInternationalShipmentMutation,
  useGetDeliveryStatusQuery,
  useUpdateDeliveryStatusMutation,
  useRejectDeliveryMutation,
} = deliveryApi;

// Backwards-compatible alias for existing UI.
export const useCreateDeliveryRequestMutation = useRequestLocalDeliveryMutation;
