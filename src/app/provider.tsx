import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { CurrencyBootstrap } from "@/features/currency/CurrencyBootstrap";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <CurrencyBootstrap />
      {children}
    </Provider>
  );
}
