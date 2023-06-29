import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import { act } from "@testing-library/react-hooks";
import React from "react";
import { OperationRecordsClient } from "src/components/clients/operationRecordsClient";
import { ProfileClient } from "src/components/clients/profileClient";
import { generateOperationRecords } from "../../../__tests__/utils";
import { Calculator } from "../../components/calculator/Calculator";
import { AuthClient } from "../../components/clients/authClient";
import { CalculatorClient } from "../../components/clients/calculatorClient";
import { DependenciesContainer, DependenciesContext } from "../../components/di/DependenciesContext";
import { useAuthStore } from "../../components/hooks/useAuthStore";
import { useCreditBalanceStore } from "../../components/hooks/useCreditBalanceStore";
import { useErrorStore } from "../../components/hooks/useErrorStore";
import { useOperationRecordsStore } from "../../components/hooks/useOperationRecordsStore";
import { OperationType } from "../../components/model/operations";
import { OperationRecords } from "../../components/operationRecords/OperationRecords";
import { Profile } from "../../components/profile/Profile";
import { CalculatorPage } from "./CalculatorPage";

jest.mock("../../components/calculator/Calculator", () => ({
  Calculator: jest.fn(() => <div>[CALCULATOR]</div>),
}));
const mockedCalculator = jest.mocked(Calculator);

jest.mock("../../components/profile/Profile", () => ({
  Profile: jest.fn(() => <div>[PROFILE]</div>),
}));
const mockedProfile = jest.mocked(Profile);

jest.mock("../../components/operationRecords/OperationRecords", () => ({
  OperationRecords: jest.fn(() => <div>[OPERATION RECORDS]</div>),
}));
const mockedOperationRecords = jest.mocked(OperationRecords);

const authClientMock: AuthClient = {
  signIn: jest.fn(),
  signOut: jest.fn(),
};
const profileClientMock: ProfileClient = {
  getCreditBalance: jest.fn(() => Promise.resolve(150)),
};
const calculatorClientMock: CalculatorClient = {
  add: jest.fn(),
  subtract: jest.fn(),
  multiply: jest.fn(),
  divide: jest.fn(),
  sqrt: jest.fn(),
  randString: jest.fn(),
};
const loadedRecords = generateOperationRecords(15, new Date("2023-06-27T10:00:00"), 5, 150);
const operationRecordsClientMock: OperationRecordsClient = {
  getRecords: jest.fn(() => Promise.resolve({ items: loadedRecords, totalItems: loadedRecords.length * 3 })),
  delete: jest.fn(),
};
const dependenciesContainer: DependenciesContainer = {
  authClient: authClientMock,
  profileClient: profileClientMock,
  calculatorClient: calculatorClientMock,
  operationRecordsClient: operationRecordsClientMock,
};

const initialAuthStoreState = useAuthStore.getState();
const initialCreditBalanceStoreState = useCreditBalanceStore.getState();
const initialErrorStoreState = useErrorStore.getState();
const initialOperationRecordsStoreState = useOperationRecordsStore.getState();

const resetStoreStates = () => {
  act(() => {
    useAuthStore.setState(initialAuthStoreState);
    useCreditBalanceStore.setState(initialCreditBalanceStoreState);
    useErrorStore.setState(initialErrorStoreState);
    useOperationRecordsStore.setState(initialOperationRecordsStoreState);
  });
};

describe("CalculatorPage page", () => {
  beforeEach(() => resetStoreStates());
  afterEach(() => resetStoreStates());

  test("Initial loads credit balance and operation records", async () => {
    // arrange
    const loadCreditBalanceMock = jest.mocked(profileClientMock.getCreditBalance);
    const loadRecordsMock = jest.mocked(operationRecordsClientMock.getRecords);

    // act
    render(
      <DependenciesContext.Provider value={dependenciesContainer}>
        <CalculatorPage />
      </DependenciesContext.Provider>,
    );

    // assert
    await waitFor(() => {
      expect(useErrorStore.getState().error).toBeFalsy();
      expect(loadCreditBalanceMock).toHaveBeenCalled();
      expect(useCreditBalanceStore.getState().creditBalance).toEqual(150);
      expect(loadRecordsMock).toHaveBeenCalled();
      expect(useOperationRecordsStore.getState().items).toStrictEqual(loadedRecords);
      expect(useOperationRecordsStore.getState().totalResults).toEqual(loadedRecords.length * 3);
    });
  });

  test("Profile component can trigger sign-out", async () => {
    // arrange
    const signOutCallMock = jest.mocked(authClientMock.signOut);

    render(
      <DependenciesContext.Provider value={dependenciesContainer}>
        <CalculatorPage />
      </DependenciesContext.Provider>,
    );

    // act
    await act(() => mockedProfile.mock.calls[0][0].onSignOut());

    // assert
    await waitFor(() => {
      expect(useErrorStore.getState().error).toBeFalsy();
      expect(signOutCallMock).toHaveBeenCalled();
    });
  });

  test("Calculate component can trigger remote calculation, credit balance is updated and operation records reloaded", async () => {
    // arrange
    const loadRecordsMock = jest.mocked(operationRecordsClientMock.getRecords);
    const calculatorDivideCallMock = jest.mocked(calculatorClientMock.divide);
    calculatorDivideCallMock.mockResolvedValue({ result: "abcd", creditBalance: 40 });

    act(() => {
      useAuthStore.setState({
        ...initialAuthStoreState,
        authToken: "auth-token",
      });
    });

    render(
      <DependenciesContext.Provider value={dependenciesContainer}>
        <CalculatorPage />
      </DependenciesContext.Provider>,
    );

    // act
    await act(async () => {
      await mockedCalculator.mock.calls[0][0].onCalculateTriggered({
        operationType: OperationType.DIVIDE,
        input1: "123",
        input2: "2",
      });
    });

    // assert
    await waitFor(() => {
      expect(useErrorStore.getState().error).toBeFalsy();
      expect(calculatorDivideCallMock).toHaveBeenCalledWith("auth-token", "123", "2");
      expect(loadRecordsMock).toHaveBeenCalledTimes(2);
      expect(useCreditBalanceStore.getState().creditBalance).toEqual(40);
      expect(useOperationRecordsStore.getState().items).toStrictEqual(loadedRecords);
      expect(useOperationRecordsStore.getState().totalResults).toEqual(loadedRecords.length * 3);
    });
  });

  test("Operation records component can trigger change page", async () => {
    // arrange
    const loadRecordsMock = jest.mocked(operationRecordsClientMock.getRecords);

    act(() => {
      useAuthStore.setState({
        ...initialAuthStoreState,
        authToken: "auth-token",
      });
    });

    render(
      <DependenciesContext.Provider value={dependenciesContainer}>
        <CalculatorPage />
      </DependenciesContext.Provider>,
    );

    // act
    await act(async () => mockedOperationRecords.mock.calls[0][0].onPageChange(5));

    // assert
    await waitFor(() => {
      expect(useErrorStore.getState().error).toBeFalsy();
      expect(loadRecordsMock).toHaveBeenCalledTimes(2);
      expect(useOperationRecordsStore.getState().page).toEqual(5);
      expect(useOperationRecordsStore.getState().items).toStrictEqual(loadedRecords);
      expect(useOperationRecordsStore.getState().totalResults).toEqual(loadedRecords.length * 3);
    });
  });

  test("Operation records component can trigger change page size", async () => {
    // arrange
    const loadRecordsMock = jest.mocked(operationRecordsClientMock.getRecords);

    act(() => {
      useAuthStore.setState({
        ...initialAuthStoreState,
        authToken: "auth-token",
      });
    });

    render(
      <DependenciesContext.Provider value={dependenciesContainer}>
        <CalculatorPage />
      </DependenciesContext.Provider>,
    );

    // act
    await act(async () => mockedOperationRecords.mock.calls[0][0].onPageSizeChange(15));

    // assert
    await waitFor(() => {
      expect(useErrorStore.getState().error).toBeFalsy();
      expect(loadRecordsMock).toHaveBeenCalledTimes(2);
      expect(useOperationRecordsStore.getState().pageSize).toEqual(15);
      expect(useOperationRecordsStore.getState().items).toStrictEqual(loadedRecords);
      expect(useOperationRecordsStore.getState().totalResults).toEqual(loadedRecords.length * 3);
    });
  });

  test("Operation records component can trigger sort page", async () => {
    // arrange
    const loadRecordsMock = jest.mocked(operationRecordsClientMock.getRecords);

    act(() => {
      useAuthStore.setState({
        ...initialAuthStoreState,
        authToken: "auth-token",
      });
    });

    render(
      <DependenciesContext.Provider value={dependenciesContainer}>
        <CalculatorPage />
      </DependenciesContext.Provider>,
    );

    // act
    await act(async () => mockedOperationRecords.mock.calls[0][0].onSortTriggered("type", "desc"));

    // assert
    await waitFor(() => {
      expect(useErrorStore.getState().error).toBeFalsy();
      expect(loadRecordsMock).toHaveBeenCalledTimes(2);
      expect(useOperationRecordsStore.getState().orderBy).toEqual("type");
      expect(useOperationRecordsStore.getState().sortDir).toEqual("desc");
      expect(useOperationRecordsStore.getState().items).toStrictEqual(loadedRecords);
      expect(useOperationRecordsStore.getState().totalResults).toEqual(loadedRecords.length * 3);
    });
  });

  test("Operation records component can trigger apply filters", async () => {
    // arrange
    const loadRecordsMock = jest.mocked(operationRecordsClientMock.getRecords);

    act(() => {
      useAuthStore.setState({
        ...initialAuthStoreState,
        authToken: "auth-token",
      });
    });

    render(
      <DependenciesContext.Provider value={dependenciesContainer}>
        <CalculatorPage />
      </DependenciesContext.Provider>,
    );

    // act
    await act(async () =>
      mockedOperationRecords.mock.calls[0][0].onFiltersApplied({
        operationType: OperationType.DIVIDE,
        inputContains: "5",
        outputContains: "3",
      }),
    );

    // assert
    await waitFor(() => {
      expect(useErrorStore.getState().error).toBeFalsy();
      expect(loadRecordsMock).toHaveBeenCalledTimes(2);
      expect(useOperationRecordsStore.getState().operationTypeFilter).toEqual(OperationType.DIVIDE);
      expect(useOperationRecordsStore.getState().inputContainsFilter).toEqual("5");
      expect(useOperationRecordsStore.getState().outputContainsFilter).toEqual("3");
      expect(useOperationRecordsStore.getState().items).toStrictEqual(loadedRecords);
      expect(useOperationRecordsStore.getState().totalResults).toEqual(loadedRecords.length * 3);
    });
  });

  test("Operation records component can trigger delete record", async () => {
    // arrange
    const operationRecord = loadedRecords[0];
    const loadRecordsMock = jest.mocked(operationRecordsClientMock.getRecords);
    const deleteRecordMock = jest.mocked(operationRecordsClientMock.delete);

    act(() => {
      useAuthStore.setState({
        ...initialAuthStoreState,
        authToken: "auth-token",
      });
    });

    render(
      <DependenciesContext.Provider value={dependenciesContainer}>
        <CalculatorPage />
      </DependenciesContext.Provider>,
    );

    // act
    await act(async () => mockedOperationRecords.mock.calls[0][0].onDeleteRecord(operationRecord));

    // assert
    await waitFor(() => {
      expect(useErrorStore.getState().error).toBeFalsy();
      expect(loadRecordsMock).toHaveBeenCalledTimes(2);
      expect(deleteRecordMock).toHaveBeenCalledWith("auth-token", operationRecord.id);
      expect(useOperationRecordsStore.getState().items).toStrictEqual(loadedRecords);
      expect(useOperationRecordsStore.getState().totalResults).toEqual(loadedRecords.length * 3);
    });
  });

  test("When deleting a record in the last page we reload the prev page (if page>0)", async () => {
    // arrange
    const operationRecord = loadedRecords[0];
    const loadRecordsMock = jest.mocked(operationRecordsClientMock.getRecords);
    const deleteRecordMock = jest.mocked(operationRecordsClientMock.delete);

    act(() => {
      useAuthStore.setState({
        ...initialAuthStoreState,
        authToken: "auth-token",
      });

      useOperationRecordsStore.setState({
        ...initialOperationRecordsStoreState,
        items: [operationRecord],
        page: 2,
      });
    });

    render(
      <DependenciesContext.Provider value={dependenciesContainer}>
        <CalculatorPage />
      </DependenciesContext.Provider>,
    );

    // act
    await act(async () => mockedOperationRecords.mock.calls[0][0].onDeleteRecord(operationRecord));

    // assert
    await waitFor(() => {
      expect(useErrorStore.getState().error).toBeFalsy();
      expect(loadRecordsMock).toHaveBeenCalledTimes(2);
      expect(deleteRecordMock).toHaveBeenCalledWith("auth-token", operationRecord.id);
      expect(useOperationRecordsStore.getState().page).toEqual(1);
      expect(useOperationRecordsStore.getState().items).toStrictEqual(loadedRecords);
      expect(useOperationRecordsStore.getState().totalResults).toEqual(loadedRecords.length * 3);
    });
  });
});
