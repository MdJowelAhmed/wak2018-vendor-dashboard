import type { FetchBaseQueryError, FetchArgs } from '@reduxjs/toolkit/query'
import type {
  AnalyticsSummary,
  AdminUser,
  DashboardOverview,
  Delivery,
  Message,
  Milestone,
  Product,
  ProductOrder,
  Service,
  ServiceOrder,
  ServicePackage,
  UserProfile,
} from '@/types/api'
import type { UserRole } from '@/features/auth/types/authTypes'
import { DASHBOARD_STATIC_DEMO } from '@/features/dashboard/hooks/static-demo'

/** Same shape as `CreateDeliveryRequestBody` in `deliveryApi` (defined here to avoid import cycle with `baseApi`). */
type CreateDeliveryRequestBody = {
  order_id: string
  pickup_location: string
  drop_location: string
  vendor_id: string
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function parseProductAvailabilityFromFormData(fd: FormData): Pick<Product, 'allCountries' | 'productCountries'> {
  const allCountries = fd.get('allCountries') === 'true'
  let codes: string[] = []
  const raw = String(fd.get('countries') ?? '[]')
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) codes = parsed.map((x) => String(x)).filter(Boolean)
  } catch {
    codes = []
  }
  if (allCountries) {
    return { allCountries: true, productCountries: [] }
  }
  return { allCountries: false, productCountries: codes }
}

const IMG = 'https://placehold.co/200x200/png?text=Product'

function makeProducts(): Product[] {
  return [
    {
      id: 'p1',
      name: 'Cold brew set',
      category: 'Home & Kitchen',
      description: 'Glass carafe and filters',
      productDetails: 'Glass carafe\nReusable filters\nEasy clean',
      price: 24.9,
      discount: 0,
      stock: 2,
      active: true,
      imageUrls: [IMG],
      mainImageIndex: 0,
      rating: 4.6,
      allCountries: true,
      productCountries: [],
      highlights: [
        { title: 'Material', value: 'Borosilicate glass' },
        { title: 'Capacity', value: '1.2L' },
      ],
    },
    {
      id: 'p2',
      name: 'Desk lamp',
      category: 'Office',
      description: 'Warm LED, adjustable',
      productDetails: 'Warm LED\nAdjustable neck\nUSB powered',
      price: 45,
      discount: 5,
      stock: 14,
      active: true,
      imageUrls: [IMG],
      mainImageIndex: 0,
      rating: 4.2,
      allCountries: false,
      productCountries: ['US', 'CA'],
      highlights: [
        { title: 'Color', value: 'Matte black' },
        { title: 'Brightness', value: '3 levels' },
      ],
    },
    {
      id: 'p3',
      name: 'Notebook pack',
      category: 'Stationery',
      description: '3 lined notebooks',
      productDetails: '3 notebooks\nA5 size\n80gsm paper',
      price: 8.5,
      stock: 0,
      active: false,
      imageUrls: [],
      mainImageIndex: 0,
      rating: 4.0,
      allCountries: false,
      productCountries: ['US'],
      highlights: [{ title: 'Pages', value: '120' }],
    },
  ]
}

function makeServices(): Service[] {
  const pkg = (n: 'basic' | 'standard' | 'premium', price: number) => ({
    name: n,
    price,
    deliveryTimeDays: n === 'basic' ? 3 : n === 'standard' ? 2 : 1,
    description: `${n} tier`,
  })
  return [
    {
      id: 's1',
      title: 'Business setup consultation',
      description: 'Incorporation and tax walkthrough',
      about: 'I will guide you through incorporation and tax basics with a clear step-by-step plan tailored to your needs.',
      packages: [pkg('basic', 90), pkg('standard', 190), pkg('premium', 350)],
      category: 'Consulting',
      pricingType: 'fixed',
      price: 190,
      deliveryTimeDays: 2,
      imageUrl: 'https://placehold.co/600x600/png?text=Service',
      services: ['Business registration guidance', 'Tax basics walkthrough'],
      technologies: { frontend: '', backend: '', database: '' },
      benefits: ['Fast turnaround', 'Clear steps'],
      providerName: 'Demo Provider',
      rating: 4.7,
    },
    {
      id: 's2',
      title: 'Local SEO audit',
      description: 'Keyword and competitor snapshot',
      about: 'I will audit your local SEO presence and deliver an actionable plan to improve visibility and rankings.',
      packages: [pkg('basic', 120), pkg('standard', 250), pkg('premium', 480)],
      category: 'Marketing',
      pricingType: 'fixed',
      price: 250,
      deliveryTimeDays: 3,
      imageUrl: 'https://placehold.co/600x600/png?text=Service',
      services: ['Competitor snapshot', 'Keyword list', 'Action plan'],
      technologies: { frontend: '', backend: '', database: '' },
      benefits: ['Actionable report', 'Prioritized fixes'],
      providerName: 'Demo Provider',
      rating: 4.4,
    },
  ]
}

const iso = (d: Date) => d.toISOString()

const store = {
  products: makeProducts(),
  services: makeServices(),
  productOrders: [
    {
      id: 'po-1',
      type: 'product' as const,
      productId: 'p1',
      productName: 'Cold brew set',
      customerName: 'Asha Rahman',
      customer: {
        name: 'Asha Rahman',
        phone: '+8801XXXXXXXXX',
        email: 'asha@example.com',
        address: 'House 12, Road 3, Dhanmondi, Dhaka',
      },
      items: [{ name: 'Cold brew set', quantity: 1, price: 24.9 }],
      deliveryType: null,
      total: 24.9,
      quantity: 1,
      status: 'ready' as const,
      createdAt: iso(new Date(2025, 3, 1)),
    },
    {
      id: 'po-2',
      type: 'product' as const,
      productId: 'p2',
      productName: 'Desk lamp',
      customerName: 'Liam Hossain',
      customer: {
        name: 'Liam Hossain',
        phone: '+8801XXXXXXXXX',
        email: 'liam@example.com',
        address: 'Banani, Dhaka',
      },
      items: [{ name: 'Desk lamp', quantity: 1, price: 45 }],
      deliveryType: 'local',
      total: 45,
      quantity: 1,
      status: 'delivery_requested' as const,
      createdAt: iso(new Date(2025, 3, 2)),
    },
    {
      id: 'po-3',
      type: 'product' as const,
      productId: 'p3',
      productName: 'Notebook pack',
      customerName: 'Samira Ali',
      customer: {
        name: 'Samira Ali',
        phone: '+8801711122233',
        email: 'samira@example.com',
        address: 'Port City Logistics, Chittagong 4100, Bangladesh',
      },
      items: [{ name: 'Notebook pack', quantity: 2, price: 8.5 }],
      deliveryType: 'international',
      total: 17,
      quantity: 2,
      status: 'shipment_created' as const,
      createdAt: iso(new Date(2025, 3, 3)),
    },
  ] as unknown as ProductOrder[],
  serviceOrders: [
    {
      id: 'so-1',
      type: 'service' as const,
      serviceId: 's1',
      serviceName: 'Business setup consultation',
      customerName: 'Mira K.',
      customer: {
        name: 'Mira K.',
        phone: '+8801XXXXXXXXX',
        email: 'mira@example.com',
        address: 'Gulshan 2, Dhaka',
      },
      items: [{ name: 'Business setup consultation (standard)', quantity: 1, price: 190 }],
      deliveryType: null,
      total: 190,
      packageName: 'standard',
      status: 'in_progress' as const,
      createdAt: iso(new Date(2025, 3, 1)),
    },
  ] as ServiceOrder[],
  deliveries: [
    {
      id: 'd1',
      orderId: 'po-2',
      vendorId: 'v1',
      driverName: 'Karim Uddin',
      driverId: 'dr1',
      type: 'local',
      driverStatus: 'in_transit' as const,
      deliveryStatus: 'in_transit' as const,
      pickupLocation: 'Gulshan 1, Dhaka 1212, Bangladesh',
      dropLocation: 'Banani Road 11, Dhaka 1213, Bangladesh',
      etaMinutes: 25,
      distanceKm: 6.2,
      driverPhone: '+8801911002233',
      vehicleType: 'bike',
      vehicleNumber: 'DHK-B-10294',
      currentLat: 23.7937,
      currentLng: 90.4042,
      currentAddress: 'Near Gulshan 2 circle',
      lastLocationUpdatedAt: iso(new Date()),
      deliveryFee: 5,
      deliveryPaid: false,
      paymentMethod: 'Cash on delivery',
      customerNote: 'Please ring the doorbell twice.',
      deliveryInstructions: 'Call the customer about 10 minutes before arrival.',
      orderLineItemName: 'Desk lamp',
      orderCustomerName: 'Liam Hossain',
      orderCustomerPhone: '+8801XXXXXXXXX',
      orderCustomerEmail: 'liam@example.com',
      timelineAt: {
        requested: iso(new Date(2025, 3, 2, 8, 5)),
        accepted: iso(new Date(2025, 3, 2, 8, 18)),
        picked_up: iso(new Date(2025, 3, 2, 8, 45)),
        in_transit: iso(new Date(2025, 3, 2, 9, 2)),
      },
      createdAt: iso(new Date(2025, 3, 2)),
    },
    {
      id: 'd2',
      orderId: 'po-1',
      vendorId: 'v1',
      driverName: 'Rashida Begum',
      driverId: 'dr2',
      type: 'local',
      driverStatus: 'accepted' as const,
      deliveryStatus: 'accepted' as const,
      pickupLocation: 'Vendor hub, Tejgaon Industrial Area, Dhaka 1208',
      dropLocation: 'House 12, Road 3, Dhanmondi, Dhaka 1205',
      etaMinutes: 40,
      distanceKm: 8.5,
      driverPhone: '+8801811223344',
      vehicleType: 'car',
      vehicleNumber: 'DHK-M-8812',
      deliveryFee: 5,
      deliveryPaid: true,
      paymentMethod: 'Wak Wallet',
      customerNote: '—',
      deliveryInstructions: 'Gate code 4521. Park in visitor slot B.',
      orderLineItemName: 'Cold brew set',
      orderCustomerName: 'Asha Rahman',
      orderCustomerPhone: '+8801XXXXXXXXX',
      orderCustomerEmail: 'asha@example.com',
      timelineAt: {
        requested: iso(new Date(2025, 3, 1, 10, 0)),
        accepted: iso(new Date(2025, 3, 1, 10, 22)),
      },
      createdAt: iso(new Date(2025, 3, 1)),
    },
    {
      id: 'd3',
      orderId: 'po-3',
      vendorId: 'v1',
      type: 'international',
      driverStatus: 'picked_up' as const,
      deliveryStatus: 'picked_up' as const,
      pickupLocation: 'Warehouse 4, Tejgaon Industrial Area, Dhaka 1208, Bangladesh',
      dropLocation: 'Port City Logistics, Chittagong 4100, Bangladesh',
      etaMinutes: 2880,
      distanceKm: 264,
      courier: 'DHL',
      trackingId: 'DHL-7782910463',
      trackingStatus: 'In Transit',
      deliveryFee: 15,
      deliveryPaid: true,
      paymentMethod: 'Card · Visa *4242',
      customerNote: 'Fragile — handle with care.',
      deliveryInstructions: 'Deliver to warehouse receiving dock.',
      orderLineItemName: 'Notebook pack',
      orderCustomerName: 'Samira Ali',
      orderCustomerPhone: '+8801711122233',
      orderCustomerEmail: 'samira@example.com',
      timelineAt: {
        requested: iso(new Date(2025, 3, 3, 9, 0)),
        accepted: iso(new Date(2025, 3, 3, 9, 25)),
        picked_up: iso(new Date(2025, 3, 3, 11, 0)),
      },
      createdAt: iso(new Date(2025, 3, 3)),
    },
  ] as Delivery[],
  messagesByConvo: {
    c1: [
      {
        id: 'm1',
        conversationId: 'c1',
        senderId: 'u1',
        message: 'Is the product still in stock?',
        type: 'text' as const,
        seen: false,
        createdAt: iso(new Date(2025, 3, 1)),
      },
    ],
  } as Record<string, Message[]>,
  conversations: [
    {
      id: 'c1',
      title: 'Order #po-1',
      participantName: 'Asha Rahman',
      lastMessage: 'Is the product still in stock?',
      updatedAt: iso(new Date(2025, 3, 1)),
      context: 'product' as const,
    },
  ],
  adminUsers: [
    {
      id: 'user-1',
      name: 'Demo User',
      email: 'demo@wak.app',
      role: 'vendor' as const,
      status: 'active' as const,
      createdAt: iso(new Date(2025, 1, 1)),
    },
    {
      id: 'admin-1',
      name: 'Admin',
      email: 'admin@wak.app',
      role: 'vendor' as const,
      status: 'active' as const,
      createdAt: iso(new Date(2025, 1, 1)),
    },
  ] as AdminUser[],
  milestonesByOrder: {
    'so-1': [
      {
        id: 'ms-1',
        orderId: 'so-1',
        title: 'Kickoff & requirements',
        description: 'Confirm scope and collect required materials.',
        amount: 60,
        status: 'approved' as const,
        createdAt: iso(new Date(2025, 3, 1)),
        updatedAt: iso(new Date(2025, 3, 1)),
      },
      {
        id: 'ms-2',
        orderId: 'so-1',
        title: 'Initial draft',
        description: 'Deliver first working draft for review.',
        amount: 80,
        status: 'active' as const,
        createdAt: iso(new Date(2025, 3, 2)),
        updatedAt: iso(new Date(2025, 3, 2)),
      },
    ],
  } as Record<string, Milestone[]>,
}

function enrichDeliveryFromOrder(d: Delivery) {
  const po = store.productOrders.find((x) => x.id === d.orderId)
  const so = store.serviceOrders.find((x) => x.id === d.orderId)
  if (po) {
    if (!d.orderLineItemName) d.orderLineItemName = po.productName
    if (!d.orderCustomerName) d.orderCustomerName = po.customer?.name ?? po.customerName
    if (!d.orderCustomerPhone) d.orderCustomerPhone = po.customer?.phone
    if (!d.orderCustomerEmail) d.orderCustomerEmail = po.customer?.email
  } else if (so) {
    if (!d.orderLineItemName) d.orderLineItemName = so.serviceName
    if (!d.orderCustomerName) d.orderCustomerName = so.customer?.name ?? so.customerName
    if (!d.orderCustomerPhone) d.orderCustomerPhone = so.customer?.phone
    if (!d.orderCustomerEmail) d.orderCustomerEmail = so.customer?.email
  }
}

const analyticsSummary: AnalyticsSummary = {
  totalRevenue: 128500,
  productSales: 82000,
  serviceEarnings: 46500,
  productOrders: 3,
  serviceOrders: 1,
  productsCount: store.products.length,
  servicesCount: store.services.length,
  pendingDeliveries: 1,
  topProducts: [
    { id: 'p1', name: 'Cold brew set', sales: 42 },
    { id: 'p2', name: 'Desk lamp', sales: 30 },
  ],
  topServices: [
    { id: 's1', name: 'Business setup', sales: 12 },
  ],
  revenueByDay: [
    { date: '04-20', amount: 1200 },
    { date: '04-21', amount: 1500 },
    { date: '04-22', amount: 980 },
    { date: '04-23', amount: 2100 },
  ],
}

function safeTrend(current: number, previous: number) {
  const delta = current - previous
  const pct = previous === 0 ? (current === 0 ? 0 : 100) : (delta / previous) * 100
  return { delta, pct: Number.isFinite(pct) ? pct : 0 }
}

function toDayKey(isoDate: string): string {
  try {
    const d = new Date(isoDate)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return isoDate.slice(0, 10)
  }
}

function makeRangePoints(range: '7d' | '30d' | '90d') {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setDate(end.getDate() - (days - 1))

  const points: Array<{ label: string; revenue: number; ordersJobs: number; _key: string }> = []
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const label = d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
    points.push({ label, revenue: 0, ordersJobs: 0, _key: key })
  }

  const allOrders = [...store.productOrders, ...store.serviceOrders]
  for (const o of allOrders) {
    const k = toDayKey((o as any).createdAt ?? '')
    const p = points.find((x) => x._key === k)
    if (!p) continue
    p.ordersJobs += 1
    p.revenue += Number((o as any).total ?? 0)
  }

  return points.map(({ _key, ...rest }) => rest)
}

function makeLoginResponse(email: string, _password: string, selectedRole: UserRole) {
  const e = (email || '').toLowerCase()
  // UI-role mode: always allow login; role is just a context selector.
  const availableRoles: UserRole[] = e.includes('both') ? ['vendor', 'service'] : ['vendor', 'service']

  return {
    accessToken: 'static-demo-token',
    user: {
      id: 'user-1',
      email: email || 'demo@wak.app',
      name: 'Demo User',
      role: selectedRole,
      roles: availableRoles,
    },
  }
}

const profile: UserProfile = {
  id: 'user-1',
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@wak.app',
  role: 'vendor',
  phone: '+1 555 0111',
  address: '200 Market St, San Francisco, CA 94105',
  country: 'United States',
}

let currentPassword = 'password123'

const TERMS_CONTENT = `## Terms & Conditions

These Terms & Conditions are provided by Admin and are view-only for vendors/service providers.

- Use the platform responsibly.
- Do not share credentials.
- Payments, refunds, and disputes follow platform policy.

Last updated: 2026-04-01
`

const PRIVACY_CONTENT = `## Privacy Policy

This Privacy Policy is provided by Admin and is view-only.

- We collect only data needed to provide services.
- We do not sell personal data.
- You can request data deletion where applicable.

Last updated: 2026-04-01
`

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'

function parseArgs(args: string | FetchArgs) {
  if (typeof args === 'string') {
    return { method: 'GET' as Method, url: args, body: undefined as unknown, params: undefined as Record<string, string> | undefined }
  }
  const a = args as FetchArgs
  return {
    method: ((a.method as string) || 'GET').toUpperCase() as Method,
    url: a.url || '',
    body: a.body,
    params: a.params as Record<string, string> | string | undefined,
  }
}

let nextId = 100

/**
 * In-memory static responses — no network. Mutations update `store` where it helps the UI.
 */
export async function getStaticRequestResult(args: string | FetchArgs): Promise<
  { data: unknown } | { error: FetchBaseQueryError }
> {
  await delay(25)
  const p = parseArgs(args)
  const u = p.url.split('?')[0] || ''
  const path = u.startsWith('/') ? u : `/${u}`

  try {
    // ——— Auth (JSON bodies) ———
    if (p.method === 'POST' && path === '/auth/login') {
      const body =
        typeof p.body === 'string'
          ? (JSON.parse(p.body) as { email?: string; password?: string; role?: unknown })
          : (p.body as { email?: string; password?: string; role?: unknown })

      const selectedRole: UserRole = body?.role === 'service' ? 'service' : 'vendor'
      return { data: makeLoginResponse(String(body?.email || ''), String(body?.password || ''), selectedRole) }
    }
    if (p.method === 'POST' && path === '/auth/register') {
      return { data: { ok: true, message: 'Registered (static)' } }
    }
    if (p.method === 'POST' && path === '/auth/send-otp') {
      return { data: { ok: true } }
    }
    if (p.method === 'POST' && path === '/auth/verify-otp') {
      return { data: { ok: true } }
    }
    if (p.method === 'POST' && path === '/auth/reset-password') {
      return { data: { ok: true } }
    }

    if (p.method === 'GET' && path === '/user/profile') {
      return { data: { ...profile } }
    }
    if (p.method === 'PUT' && path === '/user/update-profile') {
      const b = p.body as { fullName?: string; email?: string; phone?: string; address?: string }
      const full = String(b?.fullName ?? '').trim()
      if (full) {
        const parts = full.split(' ').filter(Boolean)
        profile.firstName = parts[0] ?? profile.firstName
        profile.lastName = parts.slice(1).join(' ') || profile.lastName
      }
      if (typeof b?.email === 'string' && b.email.trim()) profile.email = b.email.trim()
      if (typeof b?.phone === 'string') profile.phone = b.phone.trim()
      if (typeof b?.address === 'string') profile.address = b.address.trim()
      return { data: { ...profile } }
    }
    if (p.method === 'PUT' && path === '/user/change-password') {
      const b = p.body as { currentPassword?: string; newPassword?: string }
      const cur = String(b?.currentPassword ?? '')
      const next = String(b?.newPassword ?? '')
      if (cur !== currentPassword) {
        return { error: { status: 400, data: { message: 'Current password is incorrect' } } }
      }
      if (next.length < 6) {
        return { error: { status: 400, data: { message: 'New password must be at least 6 characters' } } }
      }
      currentPassword = next
      return { data: { ok: true } }
    }
    if (p.method === 'GET' && path === '/settings/terms') {
      return { data: { content: TERMS_CONTENT, updatedAt: '2026-04-01' } }
    }
    if (p.method === 'GET' && path === '/settings/privacy') {
      return { data: { content: PRIVACY_CONTENT, updatedAt: '2026-04-01' } }
    }
    if (p.method === 'POST' && path === '/support/message') {
      const b = p.body as { subject?: string; message?: string }
      if (!String(b?.subject ?? '').trim() || !String(b?.message ?? '').trim()) {
        return { error: { status: 400, data: { message: 'Subject and message are required' } } }
      }
      return { data: { ok: true } }
    }

    // ——— Admin ———
    if (p.method === 'GET' && path === '/admin/users') {
      return { data: [...store.adminUsers] }
    }
    if (p.method === 'PUT' && path.match(/^\/admin\/users\/[^/]+\/status$/)) {
      const id = path.split('/').filter(Boolean)[2]
      const b = p.body as { status?: AdminUser['status'] }
      const i = store.adminUsers.findIndex((u) => u.id === id)
      if (i >= 0 && b.status) {
        store.adminUsers[i] = { ...store.adminUsers[i]!, status: b.status }
        return { data: { ...store.adminUsers[i]! } }
      }
      return { error: { status: 404, data: { message: 'User not found' } } }
    }
    if (p.method === 'GET' && path === '/admin/orders') {
      return { data: [...store.productOrders, ...store.serviceOrders] }
    }
    if (p.method === 'GET' && path === '/admin/products') {
      return { data: [...store.products] }
    }
    if (p.method === 'GET' && path === '/admin/services') {
      return { data: [...store.services] }
    }
    if (p.method === 'GET' && path === '/admin/deliveries') {
      return { data: [...store.deliveries] }
    }

    if (p.method === 'GET' && path === '/vendor/products') {
      return { data: [...store.products] }
    }
    if (p.method === 'GET' && path.startsWith('/vendor/products/')) {
      const id = path.split('/').pop() || ''
      const pr = store.products.find((x) => x.id === id) ?? store.products[0]!
      return { data: { ...pr } }
    }
    if (p.method === 'POST' && path === '/vendor/products' && p.body instanceof FormData) {
      const fd = p.body
      const name = String(fd.get('name') || 'New product')
      const category = String(fd.get('category') || '')
      const discount = Number(fd.get('discount') || 0)
      const rating = Number(fd.get('rating') || 4.5)
      const desc = String(fd.get('description') || '')
      const descPointsRaw = String(fd.get('descriptionPoints') || '')
      const mainImageIndex = Number(fd.get('mainImageIndex') || 0)
      const highlightsRaw = String(fd.get('highlights') || '[]')
      let highlights: { title: string; value: string }[] = []
      try {
        const parsed = JSON.parse(highlightsRaw) as unknown
        if (Array.isArray(parsed)) {
          highlights = parsed
            .map((x) => (x && typeof x === 'object' ? (x as { title?: unknown; value?: unknown }) : null))
            .filter(Boolean)
            .map((x) => ({ title: String(x!.title ?? ''), value: String(x!.value ?? '') }))
            .filter((x) => x.title.trim() || x.value.trim())
        }
      } catch {
        highlights = []
      }
      const newP: Product = {
        id: `p${++nextId}`,
        name,
        category: category || undefined,
        description: desc,
        productDetails: descPointsRaw ? descPointsRaw : undefined,
        price: Number(fd.get('price') || 0),
        discount: Number.isFinite(discount) ? discount : 0,
        stock: Math.floor(Number(fd.get('stock') || 0)),
        active: fd.get('active') === 'true',
        imageUrls: [],
        mainImageIndex: Number.isFinite(mainImageIndex) ? mainImageIndex : 0,
        rating: Number.isFinite(rating) ? rating : 4.5,
        highlights,
        ...parseProductAvailabilityFromFormData(fd),
      }
      store.products.push(newP)
      return { data: { ...newP } }
    }
    if (p.method === 'PATCH' && path.startsWith('/vendor/products/') && path.split('/').length > 3) {
      const id = path.split('/').pop() || ''
      if (p.body instanceof FormData) {
        const fd = p.body
        const i = store.products.findIndex((x) => x.id === id)
        if (i >= 0) {
          const highlightsRaw = String(fd.get('highlights') || '')
          let highlights = store.products[i]!.highlights
          if (highlightsRaw) {
            try {
              const parsed = JSON.parse(highlightsRaw) as unknown
              if (Array.isArray(parsed)) {
                highlights = parsed
                  .map((x) => (x && typeof x === 'object' ? (x as { title?: unknown; value?: unknown }) : null))
                  .filter(Boolean)
                  .map((x) => ({ title: String(x!.title ?? ''), value: String(x!.value ?? '') }))
                  .filter((x) => x.title.trim() || x.value.trim())
              }
            } catch {
              // keep previous highlights
            }
          }
          const desc = String(fd.get('description') ?? store.products[i]!.description)
          const descPointsRaw = String(fd.get('descriptionPoints') || '')
          store.products[i] = {
            ...store.products[i]!,
            name: String(fd.get('name') || store.products[i]!.name),
            category: String(fd.get('category') || store.products[i]!.category || '') || undefined,
            description: desc,
            productDetails: descPointsRaw ? descPointsRaw : store.products[i]!.productDetails,
            price: Number(fd.get('price') || store.products[i]!.price),
            discount: Number(fd.get('discount') || store.products[i]!.discount || 0),
            stock: Math.floor(Number(fd.get('stock') || store.products[i]!.stock)),
            active: (fd.get('active') as string) === 'true',
            mainImageIndex: Number(fd.get('mainImageIndex') || store.products[i]!.mainImageIndex || 0),
            rating: Number(fd.get('rating') || store.products[i]!.rating || 4.5),
            highlights,
            ...parseProductAvailabilityFromFormData(fd),
          }
          return { data: { ...store.products[i]! } }
        }
      } else {
        const partial = p.body as Partial<Product>
        const i = store.products.findIndex((x) => x.id === id)
        if (i >= 0) {
          store.products[i] = { ...store.products[i]!, ...partial, id: store.products[i]!.id }
          return { data: { ...store.products[i]! } }
        }
      }
    }
    if (p.method === 'DELETE' && path.startsWith('/vendor/products/')) {
      const id = path.split('/').pop() || ''
      store.products = store.products.filter((x) => x.id !== id)
      return { data: undefined }
    }

    if (p.method === 'GET' && path === '/vendor/services') {
      return { data: [...store.services] }
    }
    if (p.method === 'GET' && path.startsWith('/vendor/services/')) {
      const id = path.split('/').pop() || ''
      return { data: { ...store.services.find((s) => s.id === id) ?? store.services[0]! } }
    }
    if (p.method === 'POST' && path === '/vendor/services') {
      if (p.body instanceof FormData) {
        const fd = p.body
        const title = String(fd.get('title') || 'Service')
        const about = String(fd.get('about') || fd.get('description') || '')
        const description = about
        const category = String(fd.get('category') || '')
        const pricingType = String(fd.get('pricingType') || 'fixed') as 'hourly' | 'fixed'
        const price = Number(fd.get('price') || 0)
        const deliveryTimeDays = Number(fd.get('deliveryTimeDays') || 1)
        const servicesRaw = String(fd.get('services') || '[]')
        const techRaw = String(fd.get('technologies') || '{}')
        const benefitsRaw = String(fd.get('benefits') || '[]')
        const imageUrl = String(fd.get('imageUrl') || 'https://placehold.co/600x600/png?text=Service')

        const parseArr = (raw: string) => {
          try {
            const p = JSON.parse(raw) as unknown
            return Array.isArray(p) ? p.map((x) => String(x)).filter(Boolean) : []
          } catch {
            return []
          }
        }
        const parseTech = (raw: string) => {
          try {
            const o = JSON.parse(raw) as unknown
            if (o && typeof o === 'object') {
              const r = o as { frontend?: unknown; backend?: unknown; database?: unknown }
              return {
                frontend: String(r.frontend ?? ''),
                backend: String(r.backend ?? ''),
                database: String(r.database ?? ''),
              }
            }
          } catch {
            // ignore
          }
          return { frontend: '', backend: '', database: '' }
        }

        const s: Service = {
          id: `s${++nextId}`,
          title,
          description,
          about,
          packages: [],
          category: category || undefined,
          pricingType,
          price: Number.isFinite(price) ? price : 0,
          deliveryTimeDays: Number.isFinite(deliveryTimeDays) ? deliveryTimeDays : 1,
          imageUrl,
          services: parseArr(servicesRaw),
          technologies: parseTech(techRaw),
          benefits: parseArr(benefitsRaw),
          providerName: 'Demo Provider',
          rating: 4.5,
        }
        store.services.push(s)
        return { data: s }
      }

      const b = p.body as {
        title?: string
        description?: string
        packages?: { basic: ServicePackage; standard: ServicePackage; premium: ServicePackage }
      }
      const pk = b?.packages
      if (!pk?.basic || !pk?.standard || !pk?.premium) {
        return { error: { status: 400, data: { message: 'Invalid packages' } } }
      }
      const s: Service = {
        id: `s${++nextId}`,
        title: b?.title || 'Service',
        description: b?.description || '',
        packages: [pk.basic, pk.standard, pk.premium],
      }
      store.services.push(s)
      return { data: s }
    }

    if (p.method === 'PATCH' && path.startsWith('/vendor/services/')) {
      const id = path.split('/').pop() || ''
      const i = store.services.findIndex((x) => x.id === id)
      if (i < 0) return { error: { status: 404, data: { message: 'Not found' } } }

      if (p.body instanceof FormData) {
        const fd = p.body
        const servicesRaw = String(fd.get('services') || '')
        const techRaw = String(fd.get('technologies') || '')
        const benefitsRaw = String(fd.get('benefits') || '')
        const parseArr = (raw: string, fallback?: string[]) => {
          if (!raw) return fallback
          try {
            const p = JSON.parse(raw) as unknown
            return Array.isArray(p) ? p.map((x) => String(x)).filter(Boolean) : fallback
          } catch {
            return fallback
          }
        }
        store.services[i] = {
          ...store.services[i]!,
          title: String(fd.get('title') || store.services[i]!.title),
          about: String(fd.get('about') || store.services[i]!.about || store.services[i]!.description),
          description: String(fd.get('about') || fd.get('description') || store.services[i]!.description),
          category: String(fd.get('category') || store.services[i]!.category || '') || undefined,
          pricingType: (String(fd.get('pricingType') || store.services[i]!.pricingType || 'fixed') as 'hourly' | 'fixed'),
          price: Number(fd.get('price') || store.services[i]!.price || 0),
          deliveryTimeDays: Number(fd.get('deliveryTimeDays') || store.services[i]!.deliveryTimeDays || 1),
          imageUrl: String(fd.get('imageUrl') || store.services[i]!.imageUrl || ''),
          services: parseArr(servicesRaw, store.services[i]!.services),
          technologies: (() => {
            if (!techRaw) return store.services[i]!.technologies
            try {
              const o = JSON.parse(techRaw) as unknown
              if (o && typeof o === 'object') {
                const r = o as { frontend?: unknown; backend?: unknown; database?: unknown }
                return {
                  frontend: String(r.frontend ?? ''),
                  backend: String(r.backend ?? ''),
                  database: String(r.database ?? ''),
                }
              }
            } catch {
              // ignore
            }
            return store.services[i]!.technologies
          })(),
          benefits: parseArr(benefitsRaw, store.services[i]!.benefits),
        }
        return { data: { ...store.services[i]! } }
      }

      const partial = p.body as Partial<Service>
      store.services[i] = { ...store.services[i]!, ...partial, id: store.services[i]!.id }
      return { data: { ...store.services[i]! } }
    }

    if (p.method === 'GET' && path === '/orders/products') {
      return { data: [...store.productOrders] }
    }
    if (p.method === 'GET' && path === '/orders/services') {
      return { data: [...store.serviceOrders] }
    }
    if (p.method === 'GET' && path.match(/^\/orders\/(?!products$|services$)[^/]+$/)) {
      const id = path.split('/').pop() || ''
      const po = store.productOrders.find((o) => o.id === id)
      const so = store.serviceOrders.find((o) => o.id === id)
      return { data: po ?? so ?? store.productOrders[0]! }
    }
    if (p.method === 'PATCH' && path.match(/^\/orders\/products\/[^/]+\/status$/)) {
      const id = path.split('/')[3] ?? ''
      const b = p.body as { status?: string }
      const o = store.productOrders.find((x) => x.id === id)
      if (o && b.status) {
        o.status = b.status as ProductOrder['status']
        return { data: { ...o } }
      }
    }
    if (p.method === 'PATCH' && path.match(/^\/orders\/services\/[^/]+\/status$/)) {
      const id = path.split('/')[3] ?? ''
      const b = p.body as { status?: string }
      const o = store.serviceOrders.find((x) => x.id === id)
      if (o && b.status) {
        o.status = b.status as ServiceOrder['status']
        return { data: { ...o } }
      }
    }

    if (p.method === 'GET' && path === '/vendor/deliveries') {
      return { data: [...store.deliveries] as Delivery[] }
    }
    if (p.method === 'GET' && path === '/driver/deliveries') {
      return { data: [...store.deliveries] as Delivery[] }
    }
    if (p.method === 'POST' && path === '/delivery/request') {
      const b = p.body as CreateDeliveryRequestBody
      const now = new Date().toISOString()
      const d: Delivery = {
        id: `d${++nextId}`,
        orderId: b.order_id,
        vendorId: b.vendor_id,
        driverName: '—',
        type: 'local',
        driverStatus: 'requested',
        deliveryStatus: 'requested',
        pickupLocation: b.pickup_location,
        dropLocation: b.drop_location,
        createdAt: now,
        deliveryFee: 5,
        deliveryPaid: false,
        paymentMethod: 'Pending',
        timelineAt: { requested: now },
      }
      enrichDeliveryFromOrder(d)
      store.deliveries.push(d)
      const o = store.productOrders.find((x) => x.id === b.order_id)
      if (o) {
        o.deliveryType = 'local'
        o.status = 'delivery_requested' as any
      }
      return { data: d }
    }
    if (p.method === 'POST' && path === '/delivery/international') {
      const b = p.body as {
        order_id: string
        type: 'international'
        courier: 'dhl' | 'fedex' | 'ups'
        weight: number
        dimensions: string
        pickup_location: string
        drop_location: string
        vendor_id: string
      }
      const nowIntl = new Date().toISOString()
      const d: Delivery = {
        id: `d${++nextId}`,
        orderId: b.order_id,
        vendorId: b.vendor_id,
        type: 'international',
        driverStatus: 'requested',
        deliveryStatus: 'requested',
        pickupLocation: b.pickup_location,
        dropLocation: b.drop_location,
        courier: ((): Delivery['courier'] => {
          const c = b.courier.toLowerCase()
          if (c === 'fedex') return 'FedEx'
          if (c === 'ups') return 'UPS'
          return 'DHL'
        })(),
        trackingId: `TRK-${Math.floor(Math.random() * 900000 + 100000)}`,
        trackingStatus: 'Shipment Created',
        createdAt: nowIntl,
        deliveryFee: 15,
        deliveryPaid: false,
        paymentMethod: 'Pending',
        timelineAt: { requested: nowIntl },
      }
      enrichDeliveryFromOrder(d)
      store.deliveries.push(d)
      const o = store.productOrders.find((x) => x.id === b.order_id)
      if (o) {
        o.deliveryType = 'international'
        o.status = 'shipment_created' as any
      }
      return { data: d }
    }
    if (p.method === 'GET' && path.startsWith('/delivery/by-order/')) {
      const orderId = path.split('/').pop() || ''
      const d = store.deliveries.find((x) => x.orderId === orderId) ?? null
      return { data: d ? { ...d } : null }
    }
    if (p.method === 'PATCH' && path.startsWith('/delivery/') && path.endsWith('/status')) {
      const id = path.split('/').filter(Boolean)[1]
      const b = p.body as { driverStatus?: string; deliveryStatus?: string }
      const d = store.deliveries.find((x) => x.id === id)
      if (d && b.driverStatus) {
        const st = b.driverStatus as Delivery['driverStatus']
        const ts = new Date().toISOString()
        d.timelineAt = { ...(d.timelineAt ?? {}) }
        if (!d.timelineAt[st]) d.timelineAt[st] = ts
        d.driverStatus = st
        d.deliveryStatus = (b.deliveryStatus as Delivery['deliveryStatus']) || d.deliveryStatus
        if (d.type === 'international') {
          const map: Record<string, string> = {
            requested: 'Shipment Created',
            accepted: 'Picked',
            picked_up: 'In Transit',
            in_transit: 'Out for Delivery',
            delivered: 'Delivered',
          }
          d.trackingStatus = map[d.driverStatus] ?? d.trackingStatus
        }
        return { data: { ...d } }
      }
    }
    if (p.method === 'POST' && path.match(/^\/delivery\/[^/]+\/reject$/)) {
      return { data: undefined }
    }

    if (p.method === 'GET' && path === '/vendor/analytics/summary') {
      return { data: { ...analyticsSummary, productsCount: store.products.length, servicesCount: store.services.length } }
    }
    if (p.method === 'GET' && path === '/vendor/analytics/dashboard-stats') {
      const role = (p.params as any)?.role === 'service' ? 'service' : 'vendor'

      const productOrders = store.productOrders.length
      const serviceOrders = store.serviceOrders.length
      const totalOrdersJobs = role === 'service' ? serviceOrders : productOrders

      const totalRevenue = [...store.productOrders, ...store.serviceOrders].reduce(
        (a, o) => a + Number((o as any).total ?? 0),
        0,
      )
      const aov = totalOrdersJobs ? totalRevenue / totalOrdersJobs : 0

      const activeDeliveries = store.deliveries.filter((d) => (d.type ?? 'local') !== 'international' && d.deliveryStatus !== 'delivered').length

      const completedJobs = store.serviceOrders.filter((o) => (o as any).status === 'completed').length
      const completionRate = serviceOrders ? (completedJobs / serviceOrders) * 100 : 0

      // Demo-friendly trends: computed in API layer (no UI hardcoding).
      const prevRevenue = totalRevenue * 0.88
      const prevOrders = totalOrdersJobs * 0.92
      const prevConv = 2.1
      const conv = role === 'service' ? 3.2 : 2.6

      const stats: any = {
        totalRevenue: { value: totalRevenue, trend: safeTrend(totalRevenue, prevRevenue) },
        totalOrdersJobs: { value: totalOrdersJobs, trend: safeTrend(totalOrdersJobs, prevOrders) },
        conversionRate: { value: conv, trend: safeTrend(conv, prevConv) },
        aov: { value: aov, trend: safeTrend(aov, prevRevenue / Math.max(1, prevOrders)) },
      }

      if (role === 'vendor') {
        stats.activeDeliveries = {
          value: activeDeliveries,
          trend: safeTrend(activeDeliveries, Math.max(0, activeDeliveries - 1)),
        }
      } else {
        stats.completionRate = {
          value: completionRate,
          trend: safeTrend(completionRate, Math.max(0, completionRate - 4)),
        }
      }

      return { data: stats }
    }

    // ——— Service Provider create service (JSON body) ———
    if (p.method === 'POST' && path === '/api/services') {
      const b =
        typeof p.body === 'string'
          ? (JSON.parse(p.body) as any)
          : (p.body as any)

      if (String(b?.role ?? '') !== 'service') {
        return { error: { status: 403, data: { message: 'Role must be service' } } }
      }

      const title = String(b?.title ?? '').trim()
      const description = String(b?.description ?? '').trim()
      const category = String(b?.category ?? '').trim()
      const pricingType = (String(b?.pricingType ?? 'fixed') as 'hourly' | 'fixed')
      const price = Number(b?.price ?? 0)
      const deliveryTimeDays = Math.max(1, Math.floor(Number(b?.deliveryTime ?? 1)))
      const imageUrl = String(b?.image ?? '').trim() || 'https://placehold.co/600x600/png?text=Service'
      const services = Array.isArray(b?.services) ? b.services.map((x: any) => String(x).trim()).filter(Boolean) : []
      const tech = Array.isArray(b?.technologies) ? b.technologies.map((x: any) => String(x).trim()).filter(Boolean) : []
      const packageDetails = Array.isArray(b?.packageDetails) ? b.packageDetails.map((x: any) => String(x).trim()).filter(Boolean) : []
      const allCountries = Boolean(b?.allCountries)
      const countries = Array.isArray(b?.countries) ? b.countries.map((x: any) => String(x).trim().toUpperCase()).filter(Boolean) : []

      if (!title || !description || !category || !Number.isFinite(price) || price <= 0) {
        return { error: { status: 400, data: { message: 'Invalid service payload' } } }
      }
      if (!allCountries && countries.length === 0) {
        return { error: { status: 400, data: { message: 'Select at least one country or all countries' } } }
      }

      const s: Service = {
        id: `s${++nextId}`,
        title,
        description,
        about: description,
        packages: [],
        category,
        pricingType,
        price,
        deliveryTimeDays,
        imageUrl,
        services,
        technologies: { frontend: tech.join(', '), backend: '', database: '' },
        benefits: packageDetails,
        providerName: 'Demo Provider',
        rating: 4.6,
        allCountries,
        serviceCountries: allCountries ? [] : countries,
      }
      store.services.push(s)
      return { data: s }
    }
    if (p.method === 'GET' && path === '/vendor/analytics/revenue-chart') {
      const range = ((p.params as any)?.range as '7d' | '30d' | '90d') || '7d'
      return { data: { range, points: makeRangePoints(range) } }
    }
    if (p.method === 'GET' && path === '/vendor/analytics/top-data') {
      const customerMap = new Map<string, { id: string; name: string; revenue: number }>()
      for (const o of [...store.productOrders, ...store.serviceOrders]) {
        const name = String((o as any).customerName ?? 'Customer')
        const id = `c-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        const prev = customerMap.get(id) ?? { id, name, revenue: 0 }
        prev.revenue += Number((o as any).total ?? 0)
        customerMap.set(id, prev)
      }

      const topCustomers = [...customerMap.values()]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6)
        .map((x, i) => ({ ...x, growthPct: (6 - i) * 2.7 }))

      const topProducts = analyticsSummary.topProducts.map((p, i) => ({
        id: p.id,
        name: p.name,
        revenue: p.sales * 25,
        growthPct: (6 - i) * 2.4,
      }))

      const topServices = analyticsSummary.topServices.map((s, i) => ({
        id: s.id,
        name: s.name,
        revenue: s.sales * 60,
        growthPct: (6 - i) * 2.0,
      }))

      return { data: { topProducts, topServices, topCustomers } }
    }

    if (p.method === 'GET' && path.startsWith('/vendor/customers/')) {
      const id = path.split('/').filter(Boolean).pop() || ''

      const allOrders = [...store.productOrders, ...store.serviceOrders]
      const byCustomer = allOrders.filter((o) => String((o as any).customerName ?? '').trim().length > 0)

      const seedName =
        byCustomer.find((o) => `c-${String((o as any).customerName).toLowerCase().replace(/[^a-z0-9]+/g, '-')}` === id)
          ? String((byCustomer.find((o) => `c-${String((o as any).customerName).toLowerCase().replace(/[^a-z0-9]+/g, '-')}` === id) as any).customerName)
          : id.replace(/^c-/, '').replace(/-/g, ' ')

      const customerOrders = byCustomer
        .filter((o) => {
          const name = String((o as any).customerName ?? '')
          const cid = `c-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
          return cid === id
        })
        .map((o) => ({
          id: String((o as any).id ?? ''),
          type: (o as any).type as 'product' | 'service',
          status: String((o as any).status ?? ''),
          amount: Number((o as any).total ?? 0),
          date: String((o as any).createdAt ?? new Date().toISOString()),
        }))
        .sort((a, b) => (b.date > a.date ? 1 : -1))

      const totalSpend = customerOrders.reduce((a, o) => a + o.amount, 0)
      const totalOrders = customerOrders.length
      const aov = totalOrders ? totalSpend / totalOrders : 0

      const lastOrderAt = customerOrders[0]?.date
      const firstOrderAt = customerOrders[customerOrders.length - 1]?.date

      const details = {
        id,
        name: seedName
          .split(' ')
          .map((s) => (s ? s[0]!.toUpperCase() + s.slice(1) : s))
          .join(' ')
          .trim() || 'Customer',
        avatarUrl: undefined,
        tags: (totalSpend > 200 ? (['vip', 'repeat_buyer'] as const) : (['repeat_buyer'] as const)).slice(),
        email: `${id}@demo.wak.app`,
        phone: '+1 555 0100',
        country: 'United States',
        signedUpAt: iso(new Date(2024, 10, 12)),
        firstOrderAt: firstOrderAt ?? iso(new Date(2025, 2, 2)),
        lastOrderAt: lastOrderAt ?? iso(new Date()),
        lastActiveAt: iso(new Date()),
        dateOfBirth: '1995-06-15',
        gender: 'Female',
        acquisitionChannel: 'organic' as const,
        referrerName: '—',
        wishlistCount: 6,
        reviewsCount: 3,
        avgRating: 4.6,
        defaultPaymentMethod: 'Visa •••• 4242',
        taxStatus: 'Non-taxable',
        emailMarketingOptIn: true,
        smsMarketingOptIn: false,
        addresses: [
          {
            id: 'addr-1',
            label: 'home',
            line1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
            country: 'United States',
            isDefault: true,
          },
          {
            id: 'addr-2',
            label: 'office',
            line1: '200 Market St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
            country: 'United States',
            isDefault: false,
          },
        ],
        lifetimeValue: {
          totalSpend,
          totalOrders,
          aov,
          points: Math.round(totalSpend / 5),
          last30DaysOrders: Math.min(3, totalOrders),
          abandonedCarts: 1,
          refunds: 0,
          refundedAmount: 0,
        },
        orders: customerOrders,
        deliveryHistory: store.deliveries
          .filter((d) => customerOrders.some((o) => o.id === d.orderId))
          .map((d) => ({ id: d.id, status: d.deliveryStatus, date: d.createdAt })),
        completedJobs: store.serviceOrders
          .filter((o) => customerOrders.some((x) => x.id === (o as any).id) && (o as any).status === 'completed')
          .map((o) => ({ id: (o as any).id, title: (o as any).serviceName ?? 'Service', date: (o as any).createdAt, amount: Number((o as any).total ?? 0) })),
        serviceReviews: [
          { id: 'rev-1', rating: 5, title: 'Great work', date: iso(new Date(2025, 3, 8)) },
          { id: 'rev-2', rating: 4, title: 'Good communication', date: iso(new Date(2025, 4, 2)) },
        ],
      }

      return { data: details }
    }
    if (p.method === 'GET' && path === '/vendor/customers') {
      const allOrders = [...store.productOrders, ...store.serviceOrders]

      const map = new Map<string, { id: string; name: string; totalSpend: number; totalOrders: number; lastOrderAt?: string }>()
      for (const o of allOrders) {
        const name = String((o as any).customerName ?? '').trim()
        if (!name) continue
        const id = `c-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        const prev = map.get(id) ?? { id, name, totalSpend: 0, totalOrders: 0, lastOrderAt: undefined }
        prev.totalSpend += Number((o as any).total ?? 0)
        prev.totalOrders += 1
        const d = String((o as any).createdAt ?? '')
        if (!prev.lastOrderAt || d > prev.lastOrderAt) prev.lastOrderAt = d
        map.set(id, prev)
      }

      const rows = [...map.values()]
        .sort((a, b) => (b.totalSpend - a.totalSpend) || ((b.lastOrderAt ?? '') > (a.lastOrderAt ?? '') ? 1 : -1))
        .map((c) => ({
          id: c.id,
          name: c.name,
          avatarUrl: undefined,
          country: 'United States',
          tags: c.totalSpend > 200 ? (['vip', 'repeat_buyer'] as const) : (['repeat_buyer'] as const),
          totalSpend: c.totalSpend,
          totalOrders: c.totalOrders,
          lastOrderAt: c.lastOrderAt,
        }))

      return { data: rows }
    }
    if (p.method === 'GET' && path === '/vendor/dashboard/overview') {
      return { data: { ...DASHBOARD_STATIC_DEMO } as DashboardOverview }
    }

    if (p.method === 'GET' && path === '/messages/conversations') {
      return { data: [...store.conversations] }
    }
    if (p.method === 'GET' && path.startsWith('/messages/') && !path.includes('conversations')) {
      const convId = path.split('/').pop() || ''
      return { data: [...(store.messagesByConvo[convId] ?? [])] }
    }
    if (p.method === 'POST' && path.match(/^\/messages\/[^/]+$/)) {
      const convId = path.split('/').filter(Boolean).pop() || ''
      if (convId === 'conversations') {
        return { error: { status: 404, data: { message: 'Not found' } } }
      }
      const b = p.body as { body: string }
      const msg: Message = {
        id: `m${++nextId}`,
        conversationId: convId,
        senderId: 'user-1',
        message: b?.body || '',
        type: 'text',
        seen: false,
        createdAt: new Date().toISOString(),
      }
      if (!store.messagesByConvo[convId]) {
        store.messagesByConvo[convId] = []
      }
      store.messagesByConvo[convId]!.push(msg)
      return { data: msg }
    }

    // ——— Milestones ———
    if (p.method === 'GET' && path.startsWith('/milestones/')) {
      const orderId = path.split('/').pop() || ''
      return { data: [...(store.milestonesByOrder[orderId] ?? [])] }
    }
    if (p.method === 'POST' && path === '/milestones') {
      const b = p.body as { orderId: string; title: string; description: string; amount: number }
      if (!b?.orderId || !String(b.title || '').trim() || !Number.isFinite(Number(b.amount)) || Number(b.amount) <= 0) {
        return { error: { status: 400, data: { message: 'Invalid milestone payload' } } }
      }
      const ms: Milestone = {
        id: `ms-${++nextId}`,
        orderId: b.orderId,
        title: String(b.title).trim(),
        description: String(b.description || '').trim(),
        amount: Number(b.amount),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      if (!store.milestonesByOrder[b.orderId]) store.milestonesByOrder[b.orderId] = []
      store.milestonesByOrder[b.orderId]!.push(ms)
      return { data: ms }
    }
    if (p.method === 'PUT' && path.match(/^\/milestones\/[^/]+\/status$/)) {
      const id = path.split('/').filter(Boolean)[1]
      const b = p.body as { status?: string }
      for (const orderId of Object.keys(store.milestonesByOrder)) {
        const arr = store.milestonesByOrder[orderId] ?? []
        const m = arr.find((x) => x.id === id)
        if (m && b.status) {
          m.status = b.status as Milestone['status']
          m.updatedAt = new Date().toISOString()
          return { data: { ...m } }
        }
      }
    }
    if (p.method === 'PUT' && path.match(/^\/milestones\/[^/]+$/)) {
      const id = path.split('/').filter(Boolean).pop() || ''
      const b = p.body as Partial<Milestone> & { orderId?: string }
      for (const orderId of Object.keys(store.milestonesByOrder)) {
        const arr = store.milestonesByOrder[orderId] ?? []
        const i = arr.findIndex((x) => x.id === id)
        if (i >= 0) {
          arr[i] = {
            ...arr[i]!,
            title: String(b.title ?? arr[i]!.title),
            description: String(b.description ?? arr[i]!.description),
            amount: Number(b.amount ?? arr[i]!.amount),
            updatedAt: new Date().toISOString(),
          }
          return { data: { ...arr[i]! } }
        }
      }
    }
    if (p.method === 'DELETE' && path.match(/^\/milestones\/[^/]+$/)) {
      const id = path.split('/').filter(Boolean).pop() || ''
      for (const orderId of Object.keys(store.milestonesByOrder)) {
        store.milestonesByOrder[orderId] = (store.milestonesByOrder[orderId] ?? []).filter((x) => x.id !== id)
      }
      return { data: undefined }
    }

    return { error: { status: 404, data: { message: `Static mode: unhandled ${p.method} ${path}` } } }
  } catch (e) {
    return { error: { status: 500, data: { message: e instanceof Error ? e.message : 'Static error' } } }
  }
}
