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

export type DeliveryRequestsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type DeliveryRequestsResponse = {
  data: Delivery[];
  pagination: DeliveryRequestsPagination;
};

function formatAddress(addr?: {
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
} | string | null) {
  if (!addr) return "";
  if (typeof addr === "string") return addr.trim();
  return [addr.address, addr.city, addr.state, addr.postalCode, addr.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}

function mapDriverStatus(raw?: string): DeliveryDriverStatus {
  switch (raw) {
    case "assigned":
    case "accepted":
      return "accepted";
    case "picked_up":
      return "picked_up";
    case "in_transit":
    case "out_for_delivery":
      return "in_transit";
    case "delivered":
      return "delivered";
    default:
      return "requested";
  }
}

function mapDeliveryData(d: any): Delivery {
  const isLocal = d.deliveryType === "local";
  const rider = d.localDelivery?.assignedRider;
  const hasRider = Boolean(rider?.name || rider?._id);
  const localStatus = d.localDeliveryStatus || d.localDelivery?.status;
  const trackingStatus = d.shipment?.trackingStatus;
  const vendorAddress =
    typeof d.vendor === "object" ? d.vendor?.address : undefined;

  const pickupLocation = isLocal
    ? d.localDelivery?.pickup?.address || vendorAddress || ""
    : vendorAddress || "";
  const dropLocation = formatAddress(d.shippingAddress) ||
    d.localDelivery?.dropoff?.address ||
    (d.deliveryOption === "pickup" ? "Customer pickup" : "");

  const driverStatus = isLocal
    ? mapDriverStatus(localStatus)
    : mapDriverStatus(trackingStatus);

  return {
    ...d,
    id: d._id,
    type: d.deliveryType,
    deliveryOption: d.deliveryOption,
    orderStatus: d.orderStatus,
    paymentStatus: d.paymentStatus,
    localDeliveryStatus: localStatus,
    orderId: d.orderId,
    vendorId: d.vendor?._id || "",
    orderCustomerName: d.customer?.name || d.shippingAddress?.fullName || "",
    orderCustomerEmail: d.customer?.email || "",
    orderCustomerPhone: d.customer?.phone || d.shippingAddress?.phone || "",
    orderLineItemName:
      d.items?.length > 1
        ? `${d.items[0]?.product?.name ?? "Item"} +${d.items.length - 1}`
        : d.items?.[0]?.product?.name || "Order items",
    pickupLocation,
    dropLocation,
    deliveryFee: d.localDelivery?.deliveryFee || 0,
    deliveryPaid: d.localDelivery?.paymentStatus === "paid" || d.paymentStatus === "paid",
    paymentMethod: d.localDelivery?.paymentMethod || d.paymentMethod,
    driverName: hasRider ? rider.name : undefined,
    driverPhone: hasRider ? rider.phone : undefined,
    vehicleType: hasRider ? rider.vehicleType : undefined,
    vehicleNumber: hasRider ? rider.vehicleNumberPlate : undefined,
    driverStatus,
    deliveryStatus: driverStatus,
    courier: d.shipment?.carrier,
    trackingId: d.shipment?.trackingId,
    trackingStatus,
    trackingUrl: d.shipment?.trackingUrl,
    labelUrl: d.shipment?.labelUrl,
    commercialInvoiceUrl: d.shipment?.commercialInvoiceUrl,
    items: d.items,
    shipment: d.shipment,
    localDelivery: d.localDelivery,
    shippingAddress: d.shippingAddress,
    customer: d.customer,
    createdAt: d.createdAt,
  };
}

export const deliveryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDeliveryRequests: build.query<
      DeliveryRequestsResponse,
      {
        searchTerm?: string;
        page?: number;
        limit?: number;
        deliveryType?: string;
      } | void
    >({
      query: (arg) => {
        const params: Record<string, any> = {};
        if (arg?.searchTerm) params.searchTerm = arg.searchTerm;
        if (arg?.page) params.page = arg.page;
        if (arg?.limit) params.limit = arg.limit;
        if (arg?.deliveryType) params.deliveryType = arg.deliveryType;
        return {
          url: "/vendors/delivery-requests/",
          params,
        };
      },
      transformResponse: (res: any): DeliveryRequestsResponse => {
        const data = res?.data || [];
        return {
          data: data.map(mapDeliveryData),
          pagination: res?.pagination || {
            page: 1,
            limit: data.length || 10,
            total: data.length,
            totalPage: 1,
          },
        };
      },
      providesTags: (r) =>
        r?.data
          ? [
              listTag,
              ...r.data.map((d) => ({ type: "Deliveries" as const, id: d.id })),
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
