import { useSyncExternalStore } from "react";

const STORAGE_KEY = "preferred_currency";
const DEFAULT_CURRENCY = "USD";

export type CurrencySnapshot = {
  currency: string;
  base: string;
  rates: Record<string, number>;
};

function readStoredCurrency() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)?.toUpperCase();
    if (value && /^[A-Z]{3}$/.test(value)) return value;
  } catch {
    /* ignore */
  }
  return DEFAULT_CURRENCY;
}

let snapshot: CurrencySnapshot = {
  currency: typeof window === "undefined" ? DEFAULT_CURRENCY : readStoredCurrency(),
  base: "USD",
  rates: { USD: 1 },
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getCurrencySnapshot() {
  return snapshot;
}

export function subscribeCurrency(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setPreferredCurrency(code: string) {
  const currency = code.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency) || currency === snapshot.currency) return;
  snapshot = { ...snapshot, currency };
  try {
    localStorage.setItem(STORAGE_KEY, currency);
  } catch {
    /* ignore */
  }
  emit();
}

export function setExchangeRates(base: string, rates: Record<string, number>) {
  snapshot = {
    ...snapshot,
    base: base || "USD",
    rates: { USD: 1, ...rates },
  };
  if (!snapshot.rates[snapshot.currency]) {
    snapshot = { ...snapshot, currency: DEFAULT_CURRENCY };
  }
  emit();
}

export function convertFromUsd(amount: number, currency = snapshot.currency) {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  const rate = snapshot.rates[currency];
  if (!Number.isFinite(rate)) return safe;
  return safe * rate;
}

export function convertToUsd(amount: number, currency = snapshot.currency) {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  const rate = snapshot.rates[currency];
  if (!rate) return safe;
  return safe / rate;
}

export function formatCurrency(amount: number, currency = snapshot.currency) {
  const converted = convertFromUsd(amount, currency);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  } catch {
    return `${currency} ${converted.toFixed(2)}`;
  }
}

export function useCurrency() {
  return useSyncExternalStore(
    subscribeCurrency,
    getCurrencySnapshot,
    getCurrencySnapshot,
  );
}
