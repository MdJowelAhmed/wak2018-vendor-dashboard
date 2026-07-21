export function formatCurrency(amount: number) {
  const n = Number(amount)
  const safe = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe)
}

