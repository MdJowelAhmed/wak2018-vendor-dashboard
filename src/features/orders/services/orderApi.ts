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
      ProductOrder[],
      { status?: ProductOrderStatus } | void
    >({
      query: (q) => ({
        url: "/product-orders/vendor/my-orders",
        params: q && q.status ? { status: q.status } : undefined,
      }),
      transformResponse: (response: any) => {
        const data = response?.data || [];
        return data.map((o: any) => ({
          ...o,
          id: o._id,
          type: "product",
          status: o.orderStatus,
          total: o.grandTotal || 0,
          quantity: o.totalQuantity || 0,
          customerName: o.customer?.name || "Unknown Customer",
          productId: o.items?.[0]?.product || "Unknown Product",
          productName: "Product Item", // Fallback, since product name isn't returned
        })) as ProductOrder[];
      },
      providesTags: (r) =>
        r
          ? [list, ...r.map((o) => ({ type: "Orders" as const, id: o.id }))]
          : [list],
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
  useGetServiceOrdersQuery,
  useGetServiceOrderByIdQuery,
  useGetOrderByIdQuery,
  useUpdateProductOrderStatusMutation,
  useUpdateServiceOrderStatusMutation,
  useDeliverServiceOrderMutation,
} = orderApi;
