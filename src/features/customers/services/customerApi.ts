import { baseApi } from "@/services/baseApi";
import type { CustomerDetails, CustomerListRow } from "@/types/api";

const tag = { type: "Customers" as const, id: "DETAIL" as const };

export const customerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query<
      CustomerListRow[],
      { role?: "vendor" | "service" } | void
    >({
      query: (arg) => {
        const role = (arg as { role?: "vendor" | "service" })?.role ?? "vendor";
        return role === "service"
          ? "/service-providers/my-customers"
          : "/vendors/my-customers";
      },
      transformResponse: (res: any) => {
        const data = res?.data || [];
        return data.map((c: any) => ({
          id: c._id,
          name: c.name,
          avatarUrl: c.profileImage,
          email: c.email,
          phone: c.phone,
          country: c.country || c.address,
          tags: c.tags || [],
          totalSpend: c.totalSpend || 0,
          totalOrders: c.ordersCount || 0,
          lastOrderAt: c.lastOrderDate,
        }));
      },
      providesTags: [tag],
    }),
    getCustomerDetails: build.query<
      CustomerDetails,
      { id: string; role?: "vendor" | "service" } | string
    >({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const role = typeof arg === "string" ? "vendor" : arg.role ?? "vendor";
        return role === "service"
          ? `/service-providers/my-customers/${id}`
          : `/vendors/my-customers/${id}`;
      },
      transformResponse: (res: any) => {
        const c = res?.data?.customer || {};
        const s = res?.data?.summary || {};

        return {
          id: c._id || "",
          name: c.name || "Unknown",
          avatarUrl: c.profileImage,
          email: c.email,
          phone: c.phone,
          country: c.country || c.address,
          tags: s.tags || [],
          lifetimeValue: {
            totalSpend: s.totalSpend || 0,
            totalOrders: s.ordersCount || 0,
            aov: s.ordersCount ? (s.totalSpend || 0) / s.ordersCount : 0,
            points: 0,
            last30DaysOrders: 0,
            abandonedCarts: 0,
            refunds: 0,
            refundedAmount: 0,
          },
          addresses: c.address
            ? [{ id: "1", label: "home" as const, line1: c.address }]
            : [],
          orders: [],
          firstOrderAt: undefined,
          lastOrderAt: s.lastOrderDate,
          signedUpAt: undefined,
        } as CustomerDetails;
      },
      providesTags: (_r, _e, arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        return [tag, { type: "Customers" as const, id }];
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetCustomersQuery, useGetCustomerDetailsQuery } = customerApi;
