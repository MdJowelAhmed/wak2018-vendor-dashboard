import type { UserRole } from "@/features/auth/types/authTypes";

export type UserProfile = {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  address?: string;
  country?: string;
};

export type Product = {
  id: string;
  name: string;
  category?: string;
  brand?: string;
  description: string;
  productDetails?: string;
  price: number;
  discount?: number;
  stock: number;
  active: boolean;
  imageUrls: string[];
  /** Index within `imageUrls` */
  mainImageIndex?: number;
  rating?: number;
  highlights?: { title: string; value: string }[];
  topHighlights?: { name: string; value: string }[];
  /** When true, product is available globally; `productCountries` ignored. */
  allCountries?: boolean;
  /** ISO country codes when not `allCountries`. */
  productCountries?: string[];
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  status?: "active" | "inactive";
  discountPrice?: number;
};

export type ServicePackage = {
  id?: string;
  name: "basic" | "standard" | "premium";
  price: number;
  deliveryTimeDays: number;
  description?: string;
};

export type Service = {
  _id: string;
  creator: string;
  name: string;
  title?: string;
  category: string;
  price: number;
  image: string;
  description: string;
  technologies: string[];
  serviceIncludes: string[];
  packageDetails: string[];
  deliveryTime: number;
  ratingCount: number;
  averageRating: number;
  status: "active" | "draft" | "inactive";
  createdAt: string;
  updatedAt: string;
  slug: string;
};

export const PRODUCT_ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  READY_FOR_PICKUP: "ready_for_pickup",
} as const;

export type PRODUCT_ORDER_STATUS =
  (typeof PRODUCT_ORDER_STATUS)[keyof typeof PRODUCT_ORDER_STATUS];

export const PRODUCT_ORDER_DELIVERY_TYPE = {
  LOCAL: "local",
  INTERNATIONAL: "international",
} as const;

export type PRODUCT_ORDER_DELIVERY_TYPE =
  (typeof PRODUCT_ORDER_DELIVERY_TYPE)[keyof typeof PRODUCT_ORDER_DELIVERY_TYPE];

export type ProductOrderStatus =
  | PRODUCT_ORDER_STATUS
  | "ready"
  | "delivery_requested"
  | "shipment_created";

export type ServiceOrderStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed";

export type ProductOrder = {
  id: string;
  orderId: string;
  type: "product";
  productId: string;
  productName: string;
  customerName: string;
  customer?: {
    _id?: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  shippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    countryCode: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
  };
  shipment?: {
    trackingStatus: string;
  };
  vendor?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  items?: {
    product: string;
    quantity: number;
    unitPrice: number;
    unitTotal: number;
    _id?: string;
  }[];
  deliveryType?: "local" | "international" | null;
  subTotal?: number;
  shippingFee?: number;
  discount?: number;
  totalQuantity?: number;
  grandTotal?: number;
  total: number;
  quantity: number;
  status: ProductOrderStatus;
  createdAt: string;
  updatedAt?: string;
  stripeSessionId?: string;
};

export type ServiceOrder = {
  id: string;
  type: "service";
  serviceId: string;
  serviceName: string;
  customerName: string;
  customer?: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items?: { name: string; quantity: number; price: number }[];
  deliveryType?: "local" | "international" | null;
  total: number;
  packageName: string;
  status: ServiceOrderStatus;
  createdAt: string;
};

export type Order = ProductOrder | ServiceOrder;

export type DeliveryDriverStatus =
  | "requested"
  | "accepted"
  | "picked_up"
  | "in_transit"
  | "delivered";

export type Delivery = {
  id: string;
  orderId: string;
  vendorId: string;
  type?: "local" | "international";
  driverId?: string;
  /** When provided by the API, shown in driver-facing UIs */
  driverName?: string;
  driverStatus: DeliveryDriverStatus;
  deliveryStatus: DeliveryDriverStatus;
  pickupLocation: string;
  dropLocation: string;
  etaMinutes?: number;
  courier?: "DHL" | "FedEx" | "UPS";
  trackingId?: string;
  trackingStatus?: string;
  createdAt: string;
  /** Approximate route distance in km */
  distanceKm?: number;
  driverPhone?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  /** Live driver position (when available) */
  currentLat?: number;
  currentLng?: number;
  currentAddress?: string;
  lastLocationUpdatedAt?: string;
  /** ISO time per lifecycle step */
  timelineAt?: Partial<Record<DeliveryDriverStatus, string>>;
  deliveryFee?: number;
  deliveryPaid?: boolean;
  paymentMethod?: string;
  customerNote?: string;
  deliveryInstructions?: string;
  /** Denormalized order summary for delivery UIs */
  orderLineItemName?: string;
  orderCustomerName?: string;
  orderCustomerPhone?: string;
  orderCustomerEmail?: string;
};

export type AnalyticsSummary = {
  totalRevenue: number;
  productSales: number;
  serviceEarnings: number;
  productOrders: number;
  serviceOrders: number;
  productsCount: number;
  servicesCount: number;
  pendingDeliveries: number;
  topProducts: { id: string; name: string; sales: number }[];
  topServices: { id: string; name: string; sales: number }[];
  revenueByDay: { date: string; amount: number }[];
};

export type Trend = {
  /** Percent change vs previous period (e.g. +12.3, -4.1) */
  pct: number;
  /** Absolute change vs previous period */
  delta: number;
};

export type AnalyticsDashboardStats = {
  totalRevenue: { value: number; trend: Trend };
  totalOrdersJobs: { value: number; trend: Trend };
  conversionRate: { value: number; trend: Trend };
  aov: { value: number; trend: Trend };
  activeDeliveries?: { value: number; trend: Trend };
  completionRate?: { value: number; trend: Trend };
};

export type AnalyticsRangeKey = "7d" | "30d" | "90d";

export type AnalyticsRevenuePoint = {
  /** Label for X axis (e.g. Apr 20) */
  label: string;
  revenue: number;
  ordersJobs: number;
};

export type AnalyticsRevenueChart = {
  range: AnalyticsRangeKey;
  points: AnalyticsRevenuePoint[];
};

export type AnalyticsTopRow = {
  id: string;
  name: string;
  revenue: number;
  growthPct: number;
};

export type AnalyticsTopData = {
  topProducts: AnalyticsTopRow[];
  topServices: AnalyticsTopRow[];
  topCustomers: AnalyticsTopRow[];
};

export type CustomerTag = "premium" | "vip" | "repeat_buyer";

export type CustomerAddress = {
  id: string;
  label: "home" | "office" | "other";
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
};

export type CustomerOrderRow = {
  id: string;
  type: "product" | "service";
  status: string;
  amount: number;
  date: string;
};

export type CustomerLifetimeValue = {
  totalSpend: number;
  totalOrders: number;
  aov: number;
  points: number;
  last30DaysOrders: number;
  abandonedCarts: number;
  refunds: number;
  refundedAmount: number;
};

export type CustomerDetails = {
  id: string;
  name: string;
  avatarUrl?: string;
  tags: CustomerTag[];
  email?: string;
  phone?: string;
  country?: string;

  // Timeline
  signedUpAt?: string;
  firstOrderAt?: string;
  lastOrderAt?: string;
  lastActiveAt?: string;
  dateOfBirth?: string;
  gender?: string;

  // Acquisition
  acquisitionChannel?: "referral" | "ads" | "organic" | "unknown";
  referrerName?: string;

  // Engagement
  wishlistCount?: number;
  reviewsCount?: number;
  avgRating?: number;

  // Billing + marketing
  defaultPaymentMethod?: string;
  taxStatus?: string;
  emailMarketingOptIn?: boolean;
  smsMarketingOptIn?: boolean;

  addresses: CustomerAddress[];
  lifetimeValue: CustomerLifetimeValue;

  // Role-based data (page decides which to show)
  orders: CustomerOrderRow[];
  deliveryHistory?: Array<{ id: string; status: string; date: string }>;
  completedJobs?: Array<{
    id: string;
    title: string;
    date: string;
    amount: number;
  }>;
  serviceReviews?: Array<{
    id: string;
    rating: number;
    title?: string;
    date: string;
  }>;
};

export type CustomerListRow = {
  id: string;
  name: string;
  avatarUrl?: string;
  country?: string;
  tags: CustomerTag[];
  totalSpend: number;
  totalOrders: number;
  lastOrderAt?: string;
};

/** Unified status label for mixed product/service recent orders in dashboard UI */
export type DashboardOrderDisplayStatus =
  | "Pending"
  | "Processing"
  | "Ready"
  | "Delivery Requested"
  | "Delivered"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export type DashboardRecentOrder = {
  id: string;
  type: "product" | "service";
  amount: number;
  /** Raw status key for theming (maps to badge colors) */
  statusKey: string;
  displayStatus: DashboardOrderDisplayStatus;
};

export type DashboardActiveDelivery = {
  id: string;
  orderId: string;
  driverName: string;
  status: "requested" | "accepted" | "in_transit" | "picked_up" | "delivered";
};

export type RevenueChartPoint = {
  label: string;
  product: number;
  service: number;
};

export type DashboardOverview = {
  totalRevenue: number;
  totalOrders: number;
  activeDeliveries: number;
  activeServices: number;
  revenueWeekly: RevenueChartPoint[];
  revenueMonthly: RevenueChartPoint[];
  recentOrders: DashboardRecentOrder[];
  activeDeliveriesList: DashboardActiveDelivery[];
  services: {
    total: number;
    active: number;
    topService: { id: string; name: string; sales?: number };
  };
  products: {
    total: number;
    lowStockCount: number;
    topProduct: { id: string; name: string; sales?: number };
  };
};

export type Participant = {
  _id: string;
  name: string;
  profileImage: string;
};

export type Chat = {
  _id: string;
  participants: Participant[];
  updatedAt: string;
  unreadCount: number;
  lastMessage: any | null;
  anotherParticipant?: Participant;
};

export type CustomOfferDetail = {
  offer?: string;
  title: string;
  description: string;
  price: number;
  status: "pending" | "accepted" | "rejected" | "withdrawn" | string;
};

export type ChatMessage = {
  _id: string;
  chat: string;
  sender: Participant | string;
  text: string;
  attachment: string;
  type: "text" | "image" | "file" | "custom_offer";
  customOffer?: CustomOfferDetail;
  seenBy: string[];
  createdAt: string;
  updatedAt?: string;
  isSeen?: boolean;
};

export type MilestoneStatus = "pending" | "active" | "submitted" | "approved";

export type Milestone = {
  id: string;
  orderId: string;
  title: string;
  description: string;
  amount: number;
  status: MilestoneStatus;
  createdAt: string;
  updatedAt?: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "suspended" | "pending_approval";
  createdAt: string;
};

export type StripeConnectDetails = {
  accountId: string;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
};

export type Wallet = {
  _id: string;
  user: string;
  availableBalance: number;
  pendingBalance: number;
  processingBalance: number;
  holdBalance: number;
  totalEarnings: number;
  currency: string;
  stripeConnect: StripeConnectDetails;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type WalletTransaction = {
  _id: string;
  transactionId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  netAmount: number;
  currency: string;
  paymentMethod: string;
  paymentGateway: string;
  gatewayTransactionId?: string;
  status: "pending" | "success" | "failed";
  type: "withdrawal" | "deposit" | "earning" | "refund";
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type WithdrawRequest = {
  _id: string;
  wallet: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  status: "pending" | "approved" | "rejected";
  method: string;
  createdAt: string;
  updatedAt: string;
};
