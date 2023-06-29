import axios, { AxiosError } from "axios";
import nock from "nock";
import { OperationType } from "../model/operations";
import { AxiosCalculatorClient, OperationResult } from "./calculatorClient";

const FAKE_BASE_URL = "http://a-dummy-url-that-not-exists";
const axiosInstance = axios.create({ baseURL: FAKE_BASE_URL, adapter: "http" });

describe("CalculatorClient", () => {
  const successfulOperationParams = [
    {
      operationType: OperationType.ADD,
      input1: "3.5",
      input2: "2",
      url: "/calculator/add",
      reqBody: {
        input1: "3.5",
        input2: "2",
      },
      expectedResult: {
        result: "5.5",
        creditBalance: 155,
      },
    },
    {
      operationType: OperationType.DIVIDE,
      input1: "3.5",
      input2: "2",
      url: "/calculator/divide",
      reqBody: {
        input1: "3.5",
        input2: "2",
      },
      expectedResult: {
        result: "1.75",
        creditBalance: 150,
      },
    },
    {
      operationType: OperationType.MULTIPLY,
      input1: "3.5",
      input2: "2",
      url: "/calculator/multiply",
      reqBody: {
        input1: "3.5",
        input2: "2",
      },
      expectedResult: {
        result: "7",
        creditBalance: 145,
      },
    },
    {
      operationType: OperationType.RAND_STR,
      url: "/calculator/random-string",
      reqBody: {},
      expectedResult: {
        result: "ABCDE",
        creditBalance: 140,
      },
    },
    {
      operationType: OperationType.SQRT,
      input1: "52",
      url: "/calculator/square-root",
      reqBody: {
        input1: "52",
      },
      expectedResult: {
        result: "7.211102550927979",
        creditBalance: 135,
      },
    },
    {
      operationType: OperationType.SUBTRACT,
      input1: "3.5",
      input2: "2",
      url: "/calculator/subtract",
      reqBody: {
        input1: "3.5",
        input2: "2",
      },
      expectedResult: {
        result: "1.5",
        creditBalance: 130,
      },
    },
  ];

  test.each(successfulOperationParams)(
    "Successful operations ($operationType)",
    async ({ operationType, input1, input2, url, reqBody, expectedResult }) => {
      // arrange
      const scope = nock(FAKE_BASE_URL)
        .post(url, JSON.stringify(reqBody))
        .matchHeader("authorization", "bearer authentication-token")
        .reply(200, JSON.stringify(expectedResult));

      const authToken = "authentication-token";
      const calculatorClient = new AxiosCalculatorClient(axiosInstance);

      // act
      let result: OperationResult;

      switch (operationType) {
        case OperationType.ADD:
          result = await calculatorClient.add(authToken, input1!, input2!);
          break;
        case OperationType.SUBTRACT:
          result = await calculatorClient.subtract(authToken, input1!, input2!);
          break;
        case OperationType.MULTIPLY:
          result = await calculatorClient.multiply(authToken, input1!, input2!);
          break;
        case OperationType.DIVIDE:
          result = await calculatorClient.divide(authToken, input1!, input2!);
          break;
        case OperationType.SQRT:
          result = await calculatorClient.sqrt(authToken, input1!);
          break;
        case OperationType.RAND_STR:
          result = await calculatorClient.randString(authToken);
          break;
      }

      // assert
      expect(result).toEqual(expectedResult);
      scope.done();
    },
  );

  const failedOperationParams = [
    {
      operationType: OperationType.ADD,
      url: "/calculator/add",
      reqBody: {
        input1: "3.5",
        input2: "2",
      },
      errorCode: 500,
    },
    {
      operationType: OperationType.DIVIDE,
      url: "/calculator/divide",
      reqBody: {
        input1: "3.5",
        input2: "2",
      },
      errorCode: 401,
    },
    {
      operationType: OperationType.MULTIPLY,
      url: "/calculator/multiply",
      reqBody: {
        input1: "3.5",
        input2: "2",
      },
      errorCode: 503,
    },
    {
      operationType: OperationType.RAND_STR,
      url: "/calculator/random-string",
      reqBody: {},
      errorCode: 404,
    },
    {
      operationType: OperationType.SQRT,
      url: "/calculator/square-root",
      reqBody: {
        input1: "52",
      },
      errorCode: 500,
    },
    {
      operationType: OperationType.SUBTRACT,
      url: "/calculator/subtract",
      reqBody: {
        input1: "3.5",
        input2: "2",
      },
      errorCode: 400,
    },
  ];

  test.each(failedOperationParams)(
    "Failed operations ($operationType)",
    async ({ operationType, url, reqBody, errorCode }) => {
      // arrange
      const scope = nock(FAKE_BASE_URL)
        .post(url, JSON.stringify(reqBody))
        .matchHeader("authorization", "bearer authentication-token")
        .reply(errorCode);

      const authToken = "authentication-token";
      const calculatorClient = new AxiosCalculatorClient(axiosInstance);

      // act & assert
      try {
        switch (operationType) {
          case OperationType.ADD:
            await calculatorClient.add(authToken, reqBody.input1!, reqBody.input2!);
            break;
          case OperationType.SUBTRACT:
            await calculatorClient.subtract(authToken, reqBody.input1!, reqBody.input2!);
            break;
          case OperationType.MULTIPLY:
            await calculatorClient.multiply(authToken, reqBody.input1!, reqBody.input2!);
            break;
          case OperationType.DIVIDE:
            await calculatorClient.divide(authToken, reqBody.input1!, reqBody.input2!);
            break;
          case OperationType.SQRT:
            await calculatorClient.sqrt(authToken, reqBody.input1!);
            break;
          case OperationType.RAND_STR:
            await calculatorClient.randString(authToken);
            break;
        }
        fail("Should blow up");
      } catch (err) {
        expect(err).toBeInstanceOf(AxiosError);

        const axiosError = err as AxiosError;
        expect(axiosError.response?.status).toEqual(errorCode);
      }

      scope.done();
    },
  );
});
