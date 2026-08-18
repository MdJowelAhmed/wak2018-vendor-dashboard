import { baseApi } from "@/services/baseApi";
import type {
  ProductOrder,
  ProductOrderStatus,
  ServiceOrder,
  ServiceOrderStatus,
} from "@/types/api";

const list = { type: "Orders" as const, id: "LIST" as const };

export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProductOrders: build.query<
      { data: ProductOrder[]; pagination: any },
      { status?: ProductOrderStatus; deliveryType?: string; page?: number; limit?: number } | void
    >({
      query: (q: any) => {
        const params: Record<string, any> = {};
        if (q?.status) params.status = q.status;
        if (q?.deliveryType) params.deliveryType = q.deliveryType;
        if (q?.page) params.page = q.page;
        if (q?.limit) params.limit = q.limit;
        return {
          url: "/product-orders/vendor/my-orders",
          params,
        };
      },
      transformResponse: (response: any) => {
        const data = response?.data || [];
        const mappedData = data.map((o: any) => ({
          ...o,
          id: o._id,
          type: "product",
          status: o.orderStatus,
          total: o.grandTotal || 0,
          quantity: o.totalQuantity || 0,
          customerName: o.customer?.name || "Unknown Customer",
          productId:
            o.items?.[0]?.product?._id ||
            o.items?.[0]?.product ||
            "Unknown Product",
          productName: o.items?.[0]?.product?.name || "Product Item",
        })) as ProductOrder[];
        return { data: mappedData, pagination: response?.pagination };
      },
      providesTags: (r) =>
        r?.data
          ? [
              list,
              ...r.data.map((o) => ({ type: "Orders" as const, id: o.id })),
            ]
          : [list],
    }),
    getProductOrderById: build.query<ProductOrder, string>({
      query: (id) => `/product-orders/vendor/my-orders/${id}`,
      transformResponse: (response: any) => {
        const o = response.data;
        return {
          ...o,
          id: o._id,
          type: "product",
          status: o.orderStatus,
          total: o.grandTotal || 0,
          quantity: o.totalQuantity || 0,
          customerName: o.customer?.name || "Unknown Customer",
          productId:
            o.items?.[0]?.product?._id ||
            o.items?.[0]?.product ||
            "Unknown Product",
          productName: o.items?.[0]?.product?.name || "Product Item",
        } as ProductOrder;
      },
      providesTags: (_r, _e, id) => [{ type: "Orders", id }],
    }),
    getServiceOrders: build.query<any[], void>({
      query: () => "/service-orders/",
      transformResponse: (res: any) => res.data || [],
      providesTags: (r) =>
        r
          ? [
              list,
              ...r.map((o: any) => ({ type: "Orders" as const, id: o._id })),
            ]
          : [list],
    }),
    getServiceOrderById: build.query<any, string>({
      query: (id) => `/service-orders/${id}`,
      transformResponse: (res: any) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Orders", id }],
    }),
    getOrderById: build.query<ProductOrder | ServiceOrder, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Orders", id }],
    }),
    updateProductOrderStatus: build.mutation<
      ProductOrder,
      { id: string; status: ProductOrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `/orders/products/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        list,
        { type: "Orders" as const, id },
      ],
    }),
    updateServiceOrderStatus: build.mutation<
      ServiceOrder,
      { id: string; status: ServiceOrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `/service-orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        list,
        { type: "Orders" as const, id },
      ],
    }),
    deliverServiceOrder: build.mutation<any, string>({
      query: (id) => ({
        url: `/service-orders/${id}/deliver`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, id) => [list, { type: "Orders" as const, id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductOrdersQuery,
  useGetProductOrderByIdQuery,
  useGetServiceOrdersQuery,
  useGetServiceOrderByIdQuery,
  useGetOrderByIdQuery,
  useUpdateProductOrderStatusMutation,
  useUpdateServiceOrderStatusMutation,
  useDeliverServiceOrderMutation,
} = orderApi;
