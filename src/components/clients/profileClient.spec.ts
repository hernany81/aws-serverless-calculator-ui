import axios, { AxiosError } from "axios";
import nock from "nock";
import { AxiosProfileClient, ProfileClient } from "./profileClient";

const FAKE_BASE_URL = "http://a-dummy-url-that-not-exists";
const axiosInstance = axios.create({ baseURL: FAKE_BASE_URL, adapter: "http" });

describe("ProfileClient", () => {
  test("Successful get credit balance", async () => {
    // arrange
    const scope = nock(FAKE_BASE_URL)
      .get("/profile")
      .matchHeader("authorization", "bearer authentication-token")
      .reply(200, '{"creditBalance": 3.4567}');
    const profileClient: ProfileClient = new AxiosProfileClient(axiosInstance);

    // act
    const result = await profileClient.getCreditBalance("authentication-token");

    // assert
    expect(result).toEqual(3.4567);
    scope.done();
  });

  test("Failed get credit balance", async () => {
    // arrange
    const scope = nock(FAKE_BASE_URL).get("/profile").reply(500);
    const profileClient: ProfileClient = new AxiosProfileClient(axiosInstance);

    // act & assert
    try {
      await profileClient.getCreditBalance("authentication-token");
      fail("Should blow up");
    } catch (err) {
      expect(err).toBeInstanceOf(AxiosError);

      const axiosError = err as AxiosError;
      expect(axiosError.response?.status).toEqual(500);
    }

    scope.done();
  });
});
