import { Axios } from "axios";

export interface OperationResult {
  result: string;
  creditBalance: number;
}

export interface CalculatorClient {
  add: (authToken: string, input1: string, input2: string) => Promise<OperationResult>;
  subtract: (authToken: string, input1: string, input2: string) => Promise<OperationResult>;
  multiply: (authToken: string, input1: string, input2: string) => Promise<OperationResult>;
  divide: (authToken: string, input1: string, input2: string) => Promise<OperationResult>;
  sqrt: (authToken: string, input1: string) => Promise<OperationResult>;
  randString: (authToken: string) => Promise<OperationResult>;
}

export class AxiosCalculatorClient implements CalculatorClient {
  constructor(private readonly axiosInstance: Axios) {}

  private async invokeOperation(
    url: string,
    authToken: string,
    input1?: string,
    input2?: string,
  ): Promise<OperationResult> {
    const result = await this.axiosInstance.post(
      `/calculator/${url}`,
      { input1, input2 },
      { headers: { Authorization: `bearer ${authToken}` } },
    );
    return result.data;
  }

  async add(authToken: string, input1: string, input2: string): Promise<OperationResult> {
    return this.invokeOperation("add", authToken, input1, input2);
  }

  async subtract(authToken: string, input1: string, input2: string): Promise<OperationResult> {
    return this.invokeOperation("subtract", authToken, input1, input2);
  }

  async multiply(authToken: string, input1: string, input2: string): Promise<OperationResult> {
    return this.invokeOperation("multiply", authToken, input1, input2);
  }

  async divide(authToken: string, input1: string, input2: string): Promise<OperationResult> {
    return this.invokeOperation("divide", authToken, input1, input2);
  }

  async sqrt(authToken: string, input1: string): Promise<OperationResult> {
    return this.invokeOperation("square-root", authToken, input1);
  }

  async randString(authToken: string): Promise<OperationResult> {
    return this.invokeOperation("random-string", authToken);
  }
}
