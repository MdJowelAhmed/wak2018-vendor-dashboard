import { baseApi } from "@/services/baseApi";
import type { ExchangeRatesResponse } from "./types";

export const exchangeRateApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExchangeRates: build.query<ExchangeRatesResponse, void>({
      query: () => "/exchange-rates",
      transformResponse: (res: any): ExchangeRatesResponse => {
        const payload = res?.rates ? res : res?.data;
        return {
          timestamp: payload?.timestamp,
          base: payload?.base || "USD",
          rates: payload?.rates || { USD: 1 },
        };
      },
      keepUnusedDataFor: 60 * 60,
    }),
  }),
  overrideExisting: false,
});

export const { useGetExchangeRatesQuery } = exchangeRateApi;
