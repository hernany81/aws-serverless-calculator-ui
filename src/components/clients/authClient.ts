import { Axios } from "axios";

export interface SuccessLoginResponse {
  token: string;
}

export interface AuthClient {
  signIn: (username: string, password: string) => Promise<SuccessLoginResponse>;
  signOut: (authToken: string) => Promise<void>;
}

export class AxiosAuthClient implements AuthClient {
  constructor(private readonly axiosInstance: Axios) {}

  async signIn(username: string, password: string): Promise<SuccessLoginResponse> {
    const authResult = await this.axiosInstance.post("/login", { username, password });
    return authResult.data as SuccessLoginResponse;
  }

  async signOut(authToken: string): Promise<void> {
    return this.axiosInstance.post("/logout", null, { headers: { Authorization: `Bearer ${authToken}` } });
  }
}
