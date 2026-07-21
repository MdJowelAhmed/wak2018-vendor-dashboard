import type { Delivery, DeliveryDriverStatus } from '@/types/api'

export type DeliveryUiStatus = {
  key: DeliveryDriverStatus
  label: string
  badgeClass: string
}

const localSteps: DeliveryUiStatus[] = [
  { key: 'requested', label: 'Requested', badgeClass: 'bg-muted text-foreground border-border' },
  { key: 'accepted', label: 'Accepted', badgeClass: 'bg-blue-600 text-white border-blue-600' },
  { key: 'picked_up', label: 'Picked Up', badgeClass: 'bg-purple-600 text-white border-purple-600' },
  { key: 'in_transit', label: 'In Transit', badgeClass: 'bg-orange-600 text-white border-orange-600' },
  { key: 'delivered', label: 'Delivered', badgeClass: 'bg-green-600 text-white border-green-600' },
]

const intlLabels: Record<DeliveryDriverStatus, string> = {
  requested: 'Shipment Created',
  accepted: 'Picked',
  picked_up: 'In Transit',
  in_transit: 'Out for Delivery',
  delivered: 'Delivered',
}

const intlSteps: DeliveryUiStatus[] = localSteps.map((s) => ({
  ...s,
  label: intlLabels[s.key],
}))

export function getSteps(deliveryType: Delivery['type']): DeliveryUiStatus[] {
  return deliveryType === 'international' ? intlSteps : localSteps
}

export function labelFor(deliveryType: Delivery['type'], status: DeliveryDriverStatus): string {
  if (deliveryType === 'international') return intlLabels[status] ?? status
  const step = localSteps.find((s) => s.key === status)
  return step?.label ?? status
}

export function badgeClassFor(deliveryType: Delivery['type'], status: DeliveryDriverStatus): string {
  const steps = getSteps(deliveryType)
  return steps.find((s) => s.key === status)?.badgeClass ?? 'bg-muted text-foreground border-border'
}

export function nextStatus(s: DeliveryDriverStatus): DeliveryDriverStatus | null {
  const flow: DeliveryDriverStatus[] = ['requested', 'accepted', 'picked_up', 'in_transit', 'delivered']
  const i = flow.indexOf(s)
  if (i < 0 || i >= flow.length - 1) return null
  return flow[i + 1] ?? null
}

