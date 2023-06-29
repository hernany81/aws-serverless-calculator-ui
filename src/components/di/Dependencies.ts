import axios from "axios";
import { AuthClient, AxiosAuthClient } from "../clients/authClient";
import { AxiosCalculatorClient, CalculatorClient } from "../clients/calculatorClient";
import { AxiosOperationRecordsClient, OperationRecordsClient } from "../clients/operationRecordsClient";
import { AxiosProfileClient, ProfileClient } from "../clients/profileClient";
import { DependenciesContainer } from "./DependenciesContext";

export function buildDependencies(backendUrl: string): DependenciesContainer {
  const axiosInstance = axios.create({ baseURL: backendUrl });

  const authClient: AuthClient = new AxiosAuthClient(axiosInstance);
  const profileClient: ProfileClient = new AxiosProfileClient(axiosInstance);
  const calculatorClient: CalculatorClient = new AxiosCalculatorClient(axiosInstance);
  const operationRecordsClient: OperationRecordsClient = new AxiosOperationRecordsClient(axiosInstance);

  return {
    authClient,
    profileClient,
    calculatorClient,
    operationRecordsClient,
  };
}
