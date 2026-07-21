import type { ServiceCountrySelection } from '@/components/CountryMultiSelect'

/** Must match `ServiceProfileSettings` localStorage key. */
export const SERVICE_PROVIDER_PROFILE_LS_KEY = 'service_settings:profile:v2'

/** Vendor Settings → Service Location (Add Product / catalog defaults). */
export const VENDOR_SERVICE_LOCATION_LS_KEY = 'vendor_settings:service_location:v1'

export function emptyServiceCountrySelection(): ServiceCountrySelection {
  return { mode: 'single', allCountries: false, countryCodes: [] }
}

export function normalizeServiceCountrySelection(raw: unknown): ServiceCountrySelection {
  const d = emptyServiceCountrySelection()
  if (!raw || typeof raw !== 'object') return d
  const o = raw as Record<string, unknown>
  return {
    mode: o.mode === 'multi' ? 'multi' : 'single',
    allCountries: Boolean(o.allCountries),
    countryCodes: Array.isArray(o.countryCodes)
      ? o.countryCodes.filter((x): x is string => typeof x === 'string' && x.length > 0)
      : [],
  }
}

/** Reads saved provider service locations for defaulting Add Service, etc. */
export function readServiceLocationFromLocalStorage(): ServiceCountrySelection {
  try {
    const raw = localStorage.getItem(SERVICE_PROVIDER_PROFILE_LS_KEY)
    if (!raw) return emptyServiceCountrySelection()
    const p = JSON.parse(raw) as { serviceLocation?: unknown }
    return normalizeServiceCountrySelection(p?.serviceLocation)
  } catch {
    return emptyServiceCountrySelection()
  }
}

const vendorLocationEmpty: ServiceCountrySelection = { mode: 'multi', allCountries: false, countryCodes: [] }

/** Vendor profile: service countries for global catalog / Add Product defaults. */
export function readVendorServiceLocationFromLocalStorage(): ServiceCountrySelection {
  try {
    const raw = localStorage.getItem(VENDOR_SERVICE_LOCATION_LS_KEY)
    if (!raw) return vendorLocationEmpty
    return normalizeServiceCountrySelection(JSON.parse(raw))
  } catch {
    return vendorLocationEmpty
  }
}

export function writeVendorServiceLocationToLocalStorage(selection: ServiceCountrySelection) {
  localStorage.setItem(VENDOR_SERVICE_LOCATION_LS_KEY, JSON.stringify(normalizeServiceCountrySelection(selection)))
}
