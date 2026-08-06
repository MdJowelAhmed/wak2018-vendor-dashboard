import { baseApi } from "@/services/baseApi";
import type {
  AnalyticsDashboardStats,
  AnalyticsRangeKey,
  AnalyticsRevenueChart,
  AnalyticsSummary,
  AnalyticsTopData,
  DashboardOverview,
} from "@/types/api";

const tag = { type: "Analytics" as const, id: "SUMMARY" as const };
const dashboardTag = { type: "Dashboard" as const, id: "OVERVIEW" as const };

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAnalytics: build.query<AnalyticsSummary, void>({
      query: () => "/vendor/analytics/summary",
      providesTags: [tag],
    }),
    getDashboardOverview: build.query<DashboardOverview, void>({
      query: () => "/vendor/dashboard/overview",
      providesTags: [dashboardTag, tag],
    }),
    getDashboardStats: build.query<
      AnalyticsDashboardStats,
      { role: "vendor" | "service" }
    >({
      query: ({ role }) => ({
        url: "/vendor/analytics/dashboard-stats",
        params: { role },
      }),
      providesTags: [tag],
    }),
    getRevenueChart: build.query<
      AnalyticsRevenueChart,
      { role: "vendor" | "service"; range: AnalyticsRangeKey }
    >({
      query: ({ role, range }) => ({
        url: "/vendor/analytics/revenue-chart",
        params: { role, range },
      }),
      providesTags: [tag],
    }),
    getTopData: build.query<AnalyticsTopData, { role: "vendor" | "service" }>({
      query: ({ role }) => ({
        url: "/vendor/analytics/top-data",
        params: { role },
      }),
      providesTags: [tag],
    }),
    getRecentOrders: build.query<any[], void>({
      query: () => "/vendors/recent-orders",
      transformResponse: (res: any) => {
        const data = res?.data || [];
        return data.map((o: any) => ({
          ...o,
          id: o._id,
          type: "product",
          status: o.orderStatus,
          total: o.grandTotal || 0,
          quantity: o.totalQuantity || 0,
          customerName: o.customer?.name || "Unknown Customer",
          productId: o.items?.[0]?.product || "Unknown Product",
          productName: "Product Item",
        }));
      },
      providesTags: ["Orders" as any],
    }),
    getActiveDeliveries: build.query<any[], void>({
      query: () => "/vendors/active-deliveries",
      transformResponse: (res: any) => {
        const data = res?.data || [];
        return data.map((d: any) => ({
          ...d,
          id: d._id,
          orderId: d.orderId || "Unknown",
          driverName: d.driver?.name || d.driverName || "—",
          driverStatus: d.deliveryStatus || d.driverStatus || "pending",
        }));
      },
      providesTags: ["Delivery" as any],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAnalyticsQuery,
  useGetDashboardOverviewQuery,
  useGetDashboardStatsQuery,
  useGetRevenueChartQuery,
  useGetTopDataQuery,
  useGetRecentOrdersQuery,
  useGetActiveDeliveriesQuery,
} = analyticsApi;
