export type ExchangeRatesResponse = {
  timestamp?: number;
  base: string;
  rates: Record<string, number>;
};
