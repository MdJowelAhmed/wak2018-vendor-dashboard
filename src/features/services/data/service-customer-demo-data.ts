import type { CustomerDetails, CustomerListRow, CustomerTag } from '@/types/api'

export type ServiceBooking = {
  id: number
  customer: string
  email: string
  country: string
  service: string
  amount: number
  status: 'Completed' | 'Ongoing' | 'Pending' | 'Cancelled'
  customerApproved: boolean
  date: string // YYYY-MM-DD
}

export const SERVICE_CUSTOMER_BOOKINGS: ServiceBooking[] = [
  {
    id: 1,
    customer: 'Mira K.',
    email: 'mira@test.com',
    country: 'USA',
    service: 'Web Development',
    amount: 190,
    status: 'Completed',
    customerApproved: true,
    date: '2025-04-01',
  },
  {
    id: 2,
    customer: 'Liam Hossain',
    email: 'liam@test.com',
    country: 'USA',
    service: 'API Integration',
    amount: 45,
    status: 'Completed',
    customerApproved: true,
    date: '2025-04-02',
  },
] as const

function slugify(s: string) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function keyFor(b: ServiceBooking) {
  const email = String(b.email || '').trim().toLowerCase()
  if (email) return `c-${slugify(email)}`
  return `c-${slugify(b.customer)}`
}

function approvedEarning(b: ServiceBooking) {
  return b.status === 'Completed' && b.customerApproved ? b.amount : 0
}

export function buildServiceCustomerList(bookings: ServiceBooking[]): CustomerListRow[] {
  const map = new Map<
    string,
    { id: string; name: string; email?: string; country?: string; totalSpend: number; totalOrders: number; lastOrderAt?: string }
  >()

  for (const b of bookings) {
    const id = keyFor(b)
    const prev = map.get(id) ?? {
      id,
      name: b.customer,
      email: String(b.email || '').trim() || undefined,
      country: b.country || undefined,
      totalSpend: 0,
      totalOrders: 0,
      lastOrderAt: undefined,
    }

    prev.totalOrders += 1
    prev.totalSpend += approvedEarning(b)
    const iso = `${b.date}T00:00:00.000Z`
    if (!prev.lastOrderAt || iso > prev.lastOrderAt) prev.lastOrderAt = iso
    map.set(id, prev)
  }

  const rows: CustomerListRow[] = [...map.values()].map((c) => {
    const tags: CustomerTag[] = c.totalOrders > 1 ? (['repeat_buyer'] as const) : []
    return {
      id: c.id,
      name: c.name,
      avatarUrl: undefined,
      country: c.country,
      tags,
      totalSpend: c.totalSpend,
      totalOrders: c.totalOrders,
      lastOrderAt: c.lastOrderAt,
    }
  })

  rows.sort((a, b) => (b.totalSpend - a.totalSpend) || ((b.lastOrderAt ?? '') > (a.lastOrderAt ?? '') ? 1 : -1))
  return rows
}

export function buildServiceCustomerDetails(bookings: ServiceBooking[], customerId: string): CustomerDetails | null {
  const list = bookings.filter((b) => keyFor(b) === customerId)
  if (!list.length) return null

  const sorted = list.slice().sort((a, b) => (b.date > a.date ? 1 : -1))
  const seed = sorted[0]!

  const totalOrders = list.length
  const totalSpend = list.reduce((sum, b) => sum + approvedEarning(b), 0)
  const approvedCount = list.filter((b) => b.status === 'Completed' && b.customerApproved).length
  const aov = approvedCount ? totalSpend / approvedCount : 0

  const orders = sorted.map((b) => ({
    id: String(b.id),
    type: 'service' as const,
    status: b.status === 'Completed' ? (b.customerApproved ? 'Completed' : 'Waiting approval') : b.status,
    amount: b.amount,
    date: `${b.date}T00:00:00.000Z`,
  }))

  const tags: CustomerTag[] = totalOrders > 1 ? (['repeat_buyer'] as const) : []

  const lastOrderAt = orders[0]?.date
  const firstOrderAt = orders[orders.length - 1]?.date

  const deliveryHistory = sorted.map((b) => ({
    id: `bk-${b.id}`,
    status: b.status,
    date: `${b.date}T00:00:00.000Z`,
  }))

  return {
    id: customerId,
    name: seed.customer,
    avatarUrl: undefined,
    tags,
    email: String(seed.email || '').trim() || undefined,
    phone: undefined,
    country: seed.country || undefined,
    addresses: [],
    lifetimeValue: {
      totalSpend,
      totalOrders,
      aov,
      points: Math.round(totalSpend / 5),
      last30DaysOrders: Math.min(2, totalOrders),
      abandonedCarts: 0,
      refunds: 0,
      refundedAmount: 0,
    },
    orders,
    deliveryHistory,
    lastOrderAt,
    firstOrderAt,
    lastActiveAt: lastOrderAt,
  }
}

