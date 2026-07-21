import type { DashboardOverview } from '@/types/api'

/**
 * Static sample data for local development and API fallbacks.
 * Disable by setting VITE_DASHBOARD_DEMO=false
 */
export const DASHBOARD_STATIC_DEMO: DashboardOverview = {
  totalRevenue: 25000,
  totalOrders: 120,
  activeDeliveries: 6,
  activeServices: 8,
  revenueWeekly: [
    { label: 'W1', product: 12000, service: 4000 },
    { label: 'W2', product: 15000, service: 5500 },
    { label: 'W3', product: 11000, service: 6200 },
    { label: 'W4', product: 18000, service: 7000 },
  ],
  revenueMonthly: [
    { label: 'Jan', product: 45000, service: 12000 },
    { label: 'Feb', product: 52000, service: 15000 },
    { label: 'Mar', product: 48000, service: 18000 },
    { label: 'Apr', product: 61000, service: 22000 },
  ],
  recentOrders: [
    { id: 'ord_1001', type: 'product', amount: 2400, statusKey: 'pending', displayStatus: 'Pending' },
    { id: 'ord_1002', type: 'service', amount: 8900, statusKey: 'processing', displayStatus: 'Processing' },
    { id: 'ord_1003', type: 'product', amount: 1500, statusKey: 'ready', displayStatus: 'Ready' },
    { id: 'ord_1004', type: 'product', amount: 3200, statusKey: 'delivery_requested', displayStatus: 'Delivery Requested' },
    { id: 'ord_1005', type: 'service', amount: 12000, statusKey: 'delivered', displayStatus: 'Completed' },
    { id: 'ord_1006', type: 'product', amount: 999, statusKey: 'delivered', displayStatus: 'Delivered' },
  ],
  activeDeliveriesList: [
    { id: 'del_1', orderId: 'ord_1004', driverName: 'Karim Uddin', status: 'in_transit' },
    { id: 'del_2', orderId: 'ord_1003', driverName: 'Rashida Begum', status: 'accepted' },
    { id: 'del_3', orderId: 'ord_1002', driverName: '—', status: 'requested' },
  ],
  services: {
    total: 12,
    active: 8,
    topService: { id: 'svc_1', name: 'Business setup (Premium)', sales: 34 },
  },
  products: {
    total: 45,
    lowStockCount: 3,
    topProduct: { id: 'pr_9', name: 'Organic honey 500g', sales: 128 },
  },
}
