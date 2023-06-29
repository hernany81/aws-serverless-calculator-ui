import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface CreditBalanceStore {
  creditBalance: number;
  setCreditBalance: (val: number) => void;
}

export const useCreditBalanceStore = create<CreditBalanceStore>()(
  immer((set) => ({
    creditBalance: -1,
    setCreditBalance: (val: number) =>
      set((state) => {
        state.creditBalance = val;
      }),
  })),
);
