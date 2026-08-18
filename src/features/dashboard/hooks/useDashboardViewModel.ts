import { useMemo } from "react";
import {
  useGetAnalyticsQuery,
  useGetDashboardOverviewQuery,
  useGetRecentOrdersQuery,
  useGetActiveDeliveriesQuery,
} from "../services/analyticsApi";
import { useGetServiceOrdersQuery } from "@/features/orders";
import { useGetProductsQuery } from "@/features/products";
import { useGetMyServicesQuery } from "@/features/services";
import type {
  AnalyticsSummary,
  DashboardActiveDelivery,
  DashboardOverview,
  DashboardRecentOrder,
  Delivery,
  ProductOrder,
  RevenueChartPoint,
  ServiceOrder,
} from "@/types/api";
import type { UserRole } from "@/features/auth/types/authTypes";

const demoEnabled = () => import.meta.env.VITE_DASHBOARD_DEMO !== "false";

function mapProductToRecent(o: ProductOrder): DashboardRecentOrder {
  const m = mapProductStatus(o.status);
  return {
    id: o.id,
    type: "product",
    amount: o.total,
    statusKey: m.key,
    displayStatus: m.display,
  };
}

function mapServiceToRecent(o: ServiceOrder): DashboardRecentOrder {
  const m = mapServiceStatus(o.status);
  return {
    id: o.id,
    type: "service",
    amount: o.total,
    statusKey: m.key,
    displayStatus: m.display,
  };
}

function mapProductStatus(s: ProductOrder["status"]): {
  display: DashboardRecentOrder["displayStatus"];
  key: string;
} {
  const table: Record<
    ProductOrder["status"],
    { display: DashboardRecentOrder["displayStatus"]; key: string }
  > = {
    pending: { display: "Pending", key: "pending" },
    confirmed: { display: "Processing", key: "processing" },
    processing: { display: "Processing", key: "processing" },
    ready: { display: "Ready", key: "ready" },
    delivery_requested: {
      display: "Delivery Requested",
      key: "delivery_requested",
    },
    shipment_created: {
      display: "Delivery Requested",
      key: "shipment_created",
    },
    delivered: { display: "Delivered", key: "delivered" },
    cancelled: { display: "Cancelled", key: "cancelled" },
  };
  return table[s] ?? { display: "Pending", key: String(s) };
}

function mapServiceStatus(s: ServiceOrder["status"]): {
  display: DashboardRecentOrder["displayStatus"];
  key: string;
} {
  const table: Record<
    ServiceOrder["status"],
    { display: DashboardRecentOrder["displayStatus"]; key: string }
  > = {
    pending: { display: "Pending", key: "pending" },
    accepted: { display: "Processing", key: "processing" },
    in_progress: { display: "In Progress", key: "processing" },
    completed: { display: "Completed", key: "delivered" },
  };
  return table[s] ?? { display: "Pending", key: String(s) };
}

function buildRecentFromOrders(
  p: ProductOrder[] | undefined,
  s: ServiceOrder[] | undefined,
  limit = 8,
): DashboardRecentOrder[] {
  const all = [
    ...(p ?? []).map((o) => ({
      row: mapProductToRecent(o),
      t: new Date(o.createdAt).getTime(),
    })),
    ...(s ?? []).map((o) => ({
      row: mapServiceToRecent(o),
      t: new Date(o.createdAt).getTime(),
    })),
  ];
  return all
    .filter((x) => !Number.isNaN(x.t))
    .sort((a, b) => b.t - a.t)
    .slice(0, limit)
    .map((x) => x.row);
}

function mapRevenueSeries(
  points: RevenueChartPoint[] | undefined,
  role: UserRole,
): RevenueChartPoint[] {
  const base = points ?? [];
  if (role === "vendor") {
    return base.map((p) => ({ ...p, service: 0 }));
  }
  return base.map((p) => ({ ...p, product: 0 }));
}

function toActiveList(deliveries: Delivery[]): DashboardActiveDelivery[] {
  return deliveries
    .filter((d) => d.driverStatus !== "delivered")
    .slice(0, 8)
    .map((d) => ({
      id: d.id,
      orderId: d.orderId,
      driverName: d.driverName?.trim() ? d.driverName : "—",
      status: d.driverStatus,
    }));
}

function buildFromAnalytics(
  a: AnalyticsSummary,
  p: ProductOrder[] | undefined,
  s: ServiceOrder[] | undefined,
  d: Delivery[] | undefined,
  products: { id: string; name: string; stock: number }[] | undefined,
  role: UserRole,
): DashboardOverview {
  const series = a.revenueByDay.map((day) => ({
    label: day.date,
    product: role === "vendor" ? day.amount : 0,
    service: role === "service" ? day.amount : 0,
  }));
  return {
    totalRevenue: role === "vendor" ? a.productSales : a.serviceEarnings,
    totalOrders: role === "vendor" ? a.productOrders : a.serviceOrders,
    activeDeliveries: role === "vendor" ? a.pendingDeliveries : 0,
    activeServices: role === "service" ? a.servicesCount : 0,
    revenueWeekly: series,
    revenueMonthly: [],
    recentOrders:
      role === "vendor"
        ? buildRecentFromOrders(p, [])
        : buildRecentFromOrders([], s),
    activeDeliveriesList: role === "vendor" && d?.length ? toActiveList(d) : [],
    services: {
      total: a.servicesCount,
      active: a.servicesCount,
      topService: a.topServices[0]
        ? {
            id: a.topServices[0].id,
            name: a.topServices[0].name,
            sales: a.topServices[0].sales,
          }
        : { id: "—", name: "—" },
    },
    products: {
      total: a.productsCount,
      lowStockCount: products ? products.filter((p) => p.stock < 5).length : 0,
      topProduct: a.topProducts[0]
        ? {
            id: a.topProducts[0].id,
            name: a.topProducts[0].name,
            sales: a.topProducts[0].sales,
          }
        : { id: "—", name: "—" },
    },
  };
}

function augment(
  base: DashboardOverview,
  p: ProductOrder[] | undefined,
  s: ServiceOrder[] | undefined,
  d: Delivery[] | undefined,
  products: { id: string; stock: number }[] | undefined,
  services: any[] | undefined,
  role: UserRole,
): DashboardOverview {
  const out = { ...base };
  const r =
    role === "vendor"
      ? buildRecentFromOrders(p, [])
      : buildRecentFromOrders([], s);
  if (r.length > 0) {
    out.recentOrders = r;
  } else if (!out.recentOrders?.length) {
    out.recentOrders = [];
  }
  if (role === "vendor" && !out.activeDeliveriesList?.length && d?.length) {
    out.activeDeliveriesList = toActiveList(d);
    out.activeDeliveries = out.activeDeliveriesList.length;
  }
  if (role === "service") {
    out.activeDeliveriesList = [];
    out.activeDeliveries = 0;
  }
  if (products) {
    const low = products.filter((x) => x.stock < 5).length;
    out.products = {
      ...out.products,
      total: out.products.total ?? products.length,
      lowStockCount: out.products.lowStockCount ?? low,
    };
  }
  if (services?.length && out.services.total == null) {
    out.services = {
      ...out.services,
      total: services.length,
      active: services.length,
    };
  }

  // Enforce role-specific revenue series and totals (prevents mixing when overview API returns combined series).
  out.revenueWeekly = mapRevenueSeries(out.revenueWeekly, role);
  out.revenueMonthly = mapRevenueSeries(out.revenueMonthly, role);
  out.recentOrders =
    role === "vendor"
      ? out.recentOrders.filter((o) => o.type === "product")
      : out.recentOrders.filter((o) => o.type === "service");
  if (role === "vendor") {
    out.activeServices = 0;
  }
  return out;
}

export function useDashboardViewModel(role: UserRole | null) {
  const overviewQ = useGetDashboardOverviewQuery();
  const analyticsQ = useGetAnalyticsQuery();
  const pOrdersQ = useGetRecentOrdersQuery();
  const sOrdersQ = useGetServiceOrdersQuery();
  const delQ = useGetActiveDeliveriesQuery();
  const productsQ = useGetProductsQuery();
  const servicesQ = useGetMyServicesQuery();
  const useDemo = demoEnabled();

  return useMemo(() => {
    const resolvedRole: UserRole | null = role;
    const refetch = async () => {
      await Promise.all([
        overviewQ.refetch(),
        analyticsQ.refetch(),
        pOrdersQ.refetch(),
        sOrdersQ.refetch(),
        delQ.refetch(),
        productsQ.refetch(),
        servicesQ.refetch(),
      ]);
    };

    if (
      !useDemo &&
      (overviewQ.isLoading || analyticsQ.isLoading) &&
      !overviewQ.data &&
      !analyticsQ.data
    ) {
      return {
        data: null,
        isDemo: false,
        isLoading: true,
        isError: false,
        refetch,
      };
    }

    const productOrdersCount = pOrdersQ.data?.length ?? 0;
    const serviceOrdersCount = sOrdersQ.data?.length ?? 0;
    const serviceCompletedCount = (sOrdersQ.data ?? []).filter(
      (o) => o.status === "completed",
    ).length;

    if (!resolvedRole) {
      return {
        data: null,
        meta: { productOrdersCount, serviceOrdersCount, serviceCompletedCount },
        isDemo: false,
        isLoading: false,
        isError: false,
        refetch,
      };
    }

    if (overviewQ.data) {
      return {
        data: augment(
          overviewQ.data,
          pOrdersQ.data,
          sOrdersQ.data,
          delQ.data,
          productsQ.data,
          servicesQ.data?.data,
          resolvedRole,
        ),
        meta: {
          productOrdersCount,
          serviceOrdersCount,
          serviceCompletedCount,
        },
        isDemo: false,
        isLoading: false,
        isError: false,
        refetch,
      };
    }

    if (analyticsQ.data) {
      const built = buildFromAnalytics(
        analyticsQ.data,
        pOrdersQ.data,
        sOrdersQ.data,
        delQ.data,
        productsQ.data,
        resolvedRole,
      );
      return {
        data: augment(
          built,
          pOrdersQ.data,
          sOrdersQ.data,
          delQ.data,
          productsQ.data,
          servicesQ.data?.data,
          resolvedRole,
        ),
        meta: {
          productOrdersCount,
          serviceOrdersCount,
          serviceCompletedCount,
        },
        isDemo: false,
        isLoading: false,
        isError: false,
        refetch,
      };
    }
    return {
      data: null,
      meta: {
        productOrdersCount,
        serviceOrdersCount,
        serviceCompletedCount,
      },
      isDemo: false,
      isLoading: false,
      isError: true,
      refetch,
    };
  }, [
    role,
    overviewQ.data,
    overviewQ.isLoading,
    overviewQ.isError,
    overviewQ.refetch,
    analyticsQ.data,
    analyticsQ.isLoading,
    analyticsQ.refetch,
    pOrdersQ.data,
    pOrdersQ.refetch,
    sOrdersQ.data,
    sOrdersQ.refetch,
    delQ.data,
    delQ.refetch,
    productsQ.data,
    productsQ.refetch,
    servicesQ.data,
    servicesQ.refetch,
    useDemo,
  ]);
}
