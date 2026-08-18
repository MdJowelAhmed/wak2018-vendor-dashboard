import { baseApi } from "@/services/baseApi";
import type {
  ShippingAddressPayload,
  ShippingAddressResponse,
} from "../types/shippingAddressTypes";

export const shippingAddressApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getShippingAddresses: build.query<ShippingAddressResponse, void>({
      query: () => "/shipping-addresses",
      providesTags: ["ShippingAddress"],
    }),
    createShippingAddress: build.mutation<
      ShippingAddressResponse,
      ShippingAddressPayload
    >({
      query: (body) => ({
        url: "/shipping-addresses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ShippingAddress"],
    }),
    updateShippingAddress: build.mutation<
      ShippingAddressResponse,
      { id: string; data: ShippingAddressPayload }
    >({
      query: ({ id, data }) => ({
        url: `/shipping-addresses/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["ShippingAddress"],
    }),
    deleteShippingAddress: build.mutation<
      ShippingAddressResponse,
      string
    >({
      query: (id) => ({
        url: `/shipping-addresses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ShippingAddress"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetShippingAddressesQuery,
  useCreateShippingAddressMutation,
  useUpdateShippingAddressMutation,
  useDeleteShippingAddressMutation,
} = shippingAddressApi;
