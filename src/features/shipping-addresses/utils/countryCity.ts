import { City, Country, State } from "country-state-city";
import type { ICity, ICountry } from "country-state-city";

export function formatPhoneCode(phonecode?: string) {
  if (!phonecode) return "";
  const cleaned = phonecode.replace(/^\+/, "").trim();
  return cleaned ? `+${cleaned}` : "";
}

export function getAllCountries(): ICountry[] {
  return Country.getAllCountries().slice().sort((a, b) => a.name.localeCompare(b.name));
}

const COUNTRY_ALIASES: Record<string, string> = {
  england: "GB",
  scotland: "GB",
  wales: "GB",
  "northern ireland": "GB",
  uk: "GB",
  "great britain": "GB",
  britain: "GB",
  usa: "US",
  america: "US",
};

export function countrySearchText(country: ICountry) {
  const extras = Object.entries(COUNTRY_ALIASES)
    .filter(([, iso]) => iso === country.isoCode)
    .map(([alias]) => alias)
    .join(" ");
  return `${country.name} ${country.isoCode} ${extras}`.trim();
}

export function findCountry(nameOrCode?: string): ICountry | undefined {
  const q = nameOrCode?.trim();
  if (!q) return undefined;
  const aliasIso = COUNTRY_ALIASES[q.toLowerCase()];
  if (aliasIso) return Country.getCountryByCode(aliasIso);
  const byIso = Country.getCountryByCode(q.toUpperCase());
  if (byIso) return byIso;
  const lower = q.toLowerCase();
  return Country.getAllCountries().find(
    (c) =>
      c.name.toLowerCase() === lower ||
      formatPhoneCode(c.phonecode) === q ||
      c.phonecode === q.replace(/^\+/, ""),
  );
}

export function getCitiesOfCountry(isoCode?: string): ICity[] {
  if (!isoCode) return [];
  const list = City.getCitiesOfCountry(isoCode) ?? [];
  const seen = new Set<string>();
  return list
    .filter((city) => {
      const key = city.name.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function findCity(isoCode: string | undefined, cityName: string | undefined) {
  if (!isoCode || !cityName) return undefined;
  const lower = cityName.trim().toLowerCase();
  return getCitiesOfCountry(isoCode).find((c) => c.name.toLowerCase() === lower);
}

export function stateNameForCity(city?: ICity) {
  if (!city) return "";
  return (
    State.getStateByCodeAndCountry(city.stateCode, city.countryCode)?.name ?? ""
  );
}
