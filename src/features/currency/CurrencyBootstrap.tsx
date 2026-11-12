import { useEffect } from "react";
import { useGetExchangeRatesQuery } from "./exchangeRateApi";
import { setExchangeRates } from "./currencyStore";

export function CurrencyBootstrap() {
  const { data } = useGetExchangeRatesQuery();

  useEffect(() => {
    if (data?.rates) setExchangeRates(data.base || "USD", data.rates);
  }, [data]);

  return null;
}
