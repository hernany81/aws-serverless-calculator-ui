import { createContext } from "react";
import { AuthClient } from "../clients/authClient";
import { CalculatorClient } from "../clients/calculatorClient";
import { OperationRecordsClient } from "../clients/operationRecordsClient";
import { ProfileClient } from "../clients/profileClient";

export interface DependenciesContainer {
  authClient: AuthClient;
  calculatorClient: CalculatorClient;
  operationRecordsClient: OperationRecordsClient;
  profileClient: ProfileClient;
}

export const DependenciesContext = createContext<DependenciesContainer | undefined>(undefined);
