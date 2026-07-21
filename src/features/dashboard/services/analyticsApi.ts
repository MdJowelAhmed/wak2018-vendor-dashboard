import { baseApi } from '@/services/baseApi'
import type {
  AnalyticsDashboardStats,
  AnalyticsRangeKey,
  AnalyticsRevenueChart,
  AnalyticsSummary,
  AnalyticsTopData,
  DashboardOverview,
} from '@/types/api'

const tag = { type: 'Analytics' as const, id: 'SUMMARY' as const }
const dashboardTag = { type: 'Dashboard' as const, id: 'OVERVIEW' as const }

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAnalytics: build.query<AnalyticsSummary, void>({
      query: () => '/vendor/analytics/summary',
      providesTags: [tag],
    }),
    getDashboardOverview: build.query<DashboardOverview, void>({
      query: () => '/vendor/dashboard/overview',
      providesTags: [dashboardTag, tag],
    }),
    getDashboardStats: build.query<AnalyticsDashboardStats, { role: 'vendor' | 'service' }>({
      query: ({ role }) => ({ url: '/vendor/analytics/dashboard-stats', params: { role } }),
      providesTags: [tag],
    }),
    getRevenueChart: build.query<AnalyticsRevenueChart, { role: 'vendor' | 'service'; range: AnalyticsRangeKey }>({
      query: ({ role, range }) => ({ url: '/vendor/analytics/revenue-chart', params: { role, range } }),
      providesTags: [tag],
    }),
    getTopData: build.query<AnalyticsTopData, { role: 'vendor' | 'service' }>({
      query: ({ role }) => ({ url: '/vendor/analytics/top-data', params: { role } }),
      providesTags: [tag],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAnalyticsQuery,
  useGetDashboardOverviewQuery,
  useGetDashboardStatsQuery,
  useGetRevenueChartQuery,
  useGetTopDataQuery,
} = analyticsApi
