import { Axios } from "axios";

export interface ProfileClient {
  getCreditBalance: (authToken: string) => Promise<number>;
}

export class AxiosProfileClient implements ProfileClient {
  constructor(private readonly axiosInstance: Axios) {}

  async getCreditBalance(authToken: string): Promise<number> {
    const authResult = await this.axiosInstance.get("/profile", { headers: { Authorization: `bearer ${authToken}` } });
    return authResult.data.creditBalance;
  }
}
