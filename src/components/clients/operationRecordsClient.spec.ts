import axios, { AxiosError } from "axios";
import nock from "nock";
import { OperationRecordAttribute, OperationType, SortDir } from "../model/operations";
import { AxiosOperationRecordsClient, PaginatedOperationRecords } from "./operationRecordsClient";

const FAKE_BASE_URL = "http://a-dummy-url-that-not-exists";
const axiosInstance = axios.create({ baseURL: FAKE_BASE_URL, adapter: "http" });

describe("OperationRecordsClient", () => {
  const successfulGetRecordsParams: {
    authToken: string;
    pageNumber: number;
    pageSize: number;
    sortField: OperationRecordAttribute;
    sortOrder: SortDir;
    operationType: OperationType | null;
    inputContains: string;
    outputContains: string;
    responseBody: { result: any[]; totalResults: number };
    expectedResult: PaginatedOperationRecords;
  }[] = [
    {
      authToken: "auth-token",
      pageNumber: 5,
      pageSize: 10,
      sortField: "cost",
      sortOrder: "asc",
      operationType: null,
      inputContains: "",
      outputContains: "",
      responseBody: {
        result: [],
        totalResults: 0,
      },
      expectedResult: {
        items: [],
        totalItems: 0,
      },
    },
    {
      authToken: "auth-token",
      pageNumber: 5,
      pageSize: 10,
      sortField: "createdDate",
      sortOrder: "desc",
      operationType: OperationType.ADD,
      inputContains: "abc",
      outputContains: "def",
      responseBody: {
        result: [
          {
            id: "ASDXCVBVB123",
            type: "ADD",
            operationInput: ["123", "0.345"],
            operationResult: "432",
            createdAt: "2023-06-27T10:00:00",
            cost: 5,
            userBalance: 34.567,
          },
          {
            id: "NVBGFDFGH",
            type: "SQRT",
            operationInput: ["123.456"],
            operationResult: "10.234",
            createdAt: "2023-06-27T10:05:00",
            cost: 3.4,
            userBalance: 38.67,
          },
        ],
        totalResults: 2,
      },
      expectedResult: {
        items: [
          {
            id: "ASDXCVBVB123",
            type: OperationType.ADD,
            input: ["123", "0.345"],
            result: "432",
            createdDate: new Date("2023-06-27T10:00:00"),
            cost: 5,
            creditBalance: 34.567,
          },
          {
            id: "NVBGFDFGH",
            type: OperationType.SQRT,
            input: ["123.456"],
            result: "10.234",
            createdDate: new Date("2023-06-27T10:05:00"),
            cost: 3.4,
            creditBalance: 38.67,
          },
        ],
        totalItems: 2,
      },
    },
  ];

  test.each(successfulGetRecordsParams)(
    "Successful get records [$#]",
    async ({
      pageNumber,
      pageSize,
      sortField,
      sortOrder,
      operationType,
      inputContains,
      outputContains,
      responseBody,
      expectedResult,
    }) => {
      // arrange
      const queryString = { pageNumber, pageSize, sortField, sortOrder, inputContains, outputContains };

      const scope = nock(FAKE_BASE_URL)
        .get("/operation-records")
        .query(operationType ? { ...queryString, operationType } : queryString)
        .matchHeader("authorization", "bearer authentication-token")
        .reply(200, JSON.stringify(responseBody));

      const operationRecordsClient = new AxiosOperationRecordsClient(axiosInstance);

      // act
      const result = await operationRecordsClient.getRecords(
        "authentication-token",
        pageNumber,
        pageSize,
        sortField,
        sortOrder,
        operationType,
        inputContains,
        outputContains,
      );

      // assert
      expect(result).toEqual(expectedResult);
      scope.done();
    },
  );

  test("Failed get records", async () => {
    // arrange
    const scope = nock(FAKE_BASE_URL)
      .get("/operation-records")
      .query(true)
      .matchHeader("authorization", "bearer authentication-token")
      .reply(500);

    const operationRecordsClient = new AxiosOperationRecordsClient(axiosInstance);

    // act & assert
    try {
      await operationRecordsClient.getRecords(
        "authentication-token",
        1,
        15,
        "creditBalance",
        "asc",
        OperationType.RAND_STR,
        "",
        "",
      );
      fail("Should blow up");
    } catch (err) {
      expect(err).toBeInstanceOf(AxiosError);

      const axiosError = err as AxiosError;
      expect(axiosError.response?.status).toEqual(500);
    }

    scope.done();
  });

  test("Successful delete record", async () => {
    // arrange
    const scope = nock(FAKE_BASE_URL)
      .delete("/operation-records/ABCDEF")
      .matchHeader("authorization", "bearer authentication-token")
      .reply(200);

    const operationRecordsClient = new AxiosOperationRecordsClient(axiosInstance);

    // act
    await operationRecordsClient.delete("authentication-token", "ABCDEF");
    scope.done();
  });

  test("Failed delete record", async () => {
    // arrange
    const scope = nock(FAKE_BASE_URL)
      .delete("/operation-records/ABCDEF")
      .matchHeader("authorization", "bearer authentication-token")
      .reply(500);

    const operationRecordsClient = new AxiosOperationRecordsClient(axiosInstance);

    // act & assert
    try {
      await operationRecordsClient.delete("authentication-token", "ABCDEF");
      fail("Should blow up");
    } catch (err) {
      expect(err).toBeInstanceOf(AxiosError);

      const axiosError = err as AxiosError;
      expect(axiosError.response?.status).toEqual(500);
    }

    scope.done();
  });
});
