import { baseApi } from "@/services/baseApi";
import { DASHBOARD_STATIC_DEMO } from "../hooks/static-demo";
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
      query: () => "/vendors/analytics/overview",
      transformResponse: (res: any) => {
        const d = res?.data || {};
        return {
          ...DASHBOARD_STATIC_DEMO,
          totalRevenue: d.totalRevenue ?? 0,
          totalOrders: d.totalOrders ?? 0,
          activeDeliveries: d.activeDeliveries ?? 0,
          products: {
            ...DASHBOARD_STATIC_DEMO.products,
            total: d.totalProducts ?? 0,
          },
        };
      },
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
    getMonthlyRevenue: build.query<
      { month: string; revenue: number }[],
      { year: number }
    >({
      query: ({ year }) => `/vendors/analytics/monthly-revenue?year=${year}`,
      transformResponse: (res: any) => res?.data || [],
      providesTags: [tag],
    }),
    getRecentOrders: build.query<any[], void>({
      query: () => "/vendors/recent-orders",
      transformResponse: (res: any) => {
        const data = res?.data || [];
        return data.map((o: any) => ({
          ...o,
          id: o.orderId || o._id,
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
  useGetMonthlyRevenueQuery,
} = analyticsApi;
