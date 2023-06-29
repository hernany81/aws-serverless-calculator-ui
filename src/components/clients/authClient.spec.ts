import axios, { AxiosError } from "axios";
import nock from "nock";
import { AxiosAuthClient } from "./authClient";

const FAKE_BASE_URL = "http://a-dummy-url-that-not-exists";
const axiosInstance = axios.create({ baseURL: FAKE_BASE_URL, adapter: "http" });

describe("authClient tests", () => {
  test("signIn successful", async () => {
    // arrange
    const scope = nock(FAKE_BASE_URL)
      .post("/login", { username: "Bill", password: "Murray" })
      .reply(200, '{"token": "ABCDEF"}');
    const authClient = new AxiosAuthClient(axiosInstance);

    // act
    const result = await authClient.signIn("Bill", "Murray");

    // assert
    expect(result).toEqual({ token: "ABCDEF" });
    scope.done();
  });

  test("signIn failed", async () => {
    // arrange
    const scope = nock(FAKE_BASE_URL)
      .post("/login", { username: "Bill", password: "Murray" })
      .reply(401, "Cannot authenticate");
    const authClient = new AxiosAuthClient(axiosInstance);

    // act & assert
    let error: AxiosError;
    try {
      await authClient.signIn("Bill", "Murray");
      fail("Should have failed");
    } catch (err) {
      expect(err).toBeInstanceOf(AxiosError);
      const axiosError = err as AxiosError;
      expect(axiosError.response!.status).toBe(401);
    }

    scope.done();
  });

  test("signOut successful", async () => {
    // arrange
    const scope = nock(FAKE_BASE_URL, { reqheaders: { authorization: "Bearer auth-token" } })
      .post("/logout")
      .reply(200);
    const authClient = new AxiosAuthClient(axiosInstance);

    // act
    await authClient.signOut("auth-token");

    // assert
    scope.done();
  });
});
