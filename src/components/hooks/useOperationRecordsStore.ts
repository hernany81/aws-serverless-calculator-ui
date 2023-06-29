import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { OperationRecordsClient } from "../clients/operationRecordsClient";
import { OperationRecord, OperationRecordAttribute, OperationType, SortDir } from "../model/operations";

export interface OperationRecordsStore {
  items: OperationRecord[];
  totalResults: number;
  page: number;
  pageSize: number;
  orderBy: OperationRecordAttribute;
  sortDir: SortDir;
  operationTypeFilter: OperationType | "ALL";
  inputContainsFilter: string;
  outputContainsFilter: string;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setOrderBy: (orderBy: OperationRecordAttribute) => void;
  setSortDir: (sortDir: SortDir) => void;
  setOperationTypeFilter: (operationTypeFilter: OperationType | "ALL") => void;
  setInputContainsFilter: (str: string) => void;
  setOutputContainsFilter: (str: string) => void;
  loadRecords: (authToken: string, client: OperationRecordsClient) => Promise<void>;
}

const operationTypeToFilterMapping: Record<OperationType, string> = {
  [OperationType.ADD]: "ADDITION",
  [OperationType.SUBTRACT]: "SUBTRACTION",
  [OperationType.MULTIPLY]: "MULTIPLICATION",
  [OperationType.DIVIDE]: "DIVISION",
  [OperationType.SQRT]: "SQUARE_ROOT",
  [OperationType.RAND_STR]: "RANDOM_STRING",
};

export const useOperationRecordsStore = create<OperationRecordsStore>()(
  immer((set, get) => ({
    items: [],
    totalResults: 0,
    page: 0,
    pageSize: 5,
    orderBy: "createdDate",
    sortDir: "desc",
    operationTypeFilter: "ALL",
    inputContainsFilter: "",
    outputContainsFilter: "",
    setPage: (newPage: number) => {
      set((state) => {
        state.page = newPage;
      });
    },
    setPageSize: (newPageSize: number) => {
      set((state) => {
        state.pageSize = newPageSize;
      });
    },
    setOrderBy: (newOrderBy: OperationRecordAttribute) => {
      set((state) => {
        state.orderBy = newOrderBy;
      });
    },
    setSortDir: (newSortDir: SortDir) => {
      set((state) => {
        state.sortDir = newSortDir;
      });
    },
    setOperationTypeFilter: (newOperationTypeFilter: OperationType | "ALL") => {
      set((state) => {
        state.operationTypeFilter = newOperationTypeFilter;
      });
    },
    setInputContainsFilter: (str: string) => {
      set((state) => {
        state.inputContainsFilter = str;
      });
    },
    setOutputContainsFilter: (str: string) => {
      set((state) => {
        state.outputContainsFilter = str;
      });
    },
    loadRecords: async (authToken, client) => {
      const operationType = get().operationTypeFilter;
      const operationTypeStr = operationType !== "ALL" ? operationTypeToFilterMapping[operationType] : null;
      const response = await client.getRecords(
        authToken,
        get().page + 1,
        get().pageSize,
        get().orderBy,
        get().sortDir,
        operationTypeStr,
        get().inputContainsFilter,
        get().outputContainsFilter,
      );

      set((state) => {
        state.items = response.items;
        state.totalResults = response.totalItems;
      });
    },
  })),
);
