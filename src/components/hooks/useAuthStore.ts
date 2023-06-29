import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface AuthStore {
  username: string;
  authToken: string;
  setCredentials: (username: string, authToken: string) => void;
  clearCredentials: () => void;
}

export const useAuthStore = create<AuthStore>()(
  // devtools(
  persist(
    immer((set, get) => ({
      username: "",
      authToken: "",
      setCredentials: (username, authToken) => {
        set((state) => {
          state.username = username;
          state.authToken = authToken;
        });
      },
      clearCredentials: () => {
        set((state) => {
          state.username = "";
          state.authToken = "";
        });
      },
    })),
    { name: "serverless-calculator-ui" },
  ),
);
// );
