import { Axios } from "axios";
import { OperationRecord, OperationRecordAttribute, SortDir } from "../model/operations";

export interface PaginatedOperationRecords {
  items: OperationRecord[];
  totalItems: number;
}

export interface OperationRecordsClient {
  getRecords: (
    authToken: string,
    pageNumber: number,
    pageSize: number,
    sortField: OperationRecordAttribute,
    sortOrder: SortDir,
    operationType: string | null,
    inputContains: string,
    outputContains: string,
  ) => Promise<PaginatedOperationRecords>;

  delete: (authToken: string, id: string) => Promise<void>;
}

export class AxiosOperationRecordsClient implements OperationRecordsClient {
  constructor(private readonly axiosInstance: Axios) {}

  async getRecords(
    authToken: string,
    pageNumber: number,
    pageSize: number,
    sortField: keyof OperationRecord,
    sortOrder: SortDir,
    operationType: string | null,
    inputContains: string,
    outputContains: string,
  ): Promise<PaginatedOperationRecords> {
    const response = await this.axiosInstance.get(`/operation-records`, {
      headers: { Authorization: `bearer ${authToken}` },
      params: {
        pageNumber,
        pageSize,
        sortField,
        sortOrder,
        operationType,
        inputContains,
        outputContains,
      },
    });

    const transformedItems: OperationRecord[] = (response.data.result as any[]).map((x) => {
      return {
        id: x.id,
        type: x.type,
        input: x.operationInput,
        result: x.operationResult,
        createdDate: new Date(x.createdAt),
        cost: x.cost,
        creditBalance: x.userBalance,
      };
    });

    return {
      items: transformedItems,
      totalItems: response.data.totalResults,
    };
  }

  async delete(authToken: string, id: string): Promise<void> {
    return this.axiosInstance.delete(`/operation-records/${id}`, {
      headers: { Authorization: `bearer ${authToken}` },
    });
  }
}
