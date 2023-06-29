import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface ErrorStore {
  error: Error | undefined;
  runCallback: (callback: () => void) => void;
  runAsyncCallback: (callback: () => Promise<void>) => Promise<void>;
  clearError: () => void;
}

export const useErrorStore = create<ErrorStore>()(
  immer((set) => ({
    error: undefined,
    runCallback(callback) {
      try {
        return callback();
      } catch (error) {
        set((state) => {
          state.error = error;
        });
      }
    },
    runAsyncCallback: async (callback: () => Promise<void>) => {
      try {
        await callback();
      } catch (error) {
        set((state) => {
          state.error = error;
        });
      }
    },
    clearError: () => {
      set((state) => {
        state.error = undefined;
      });
    },
  })),
);
