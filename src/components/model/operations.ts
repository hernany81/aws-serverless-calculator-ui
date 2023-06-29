export enum OperationType {
  ADD = "ADD",
  SUBTRACT = "SUBTRACT",
  MULTIPLY = "MULTIPLY",
  DIVIDE = "DIVIDE",
  SQRT = "SQRT",
  RAND_STR = "RAND_STR",
}

export const calculatorOperationRequiredInputsCfg: Record<OperationType, number> = {
  [OperationType.ADD]: 2,
  [OperationType.SUBTRACT]: 2,
  [OperationType.MULTIPLY]: 2,
  [OperationType.DIVIDE]: 2,
  [OperationType.SQRT]: 1,
  [OperationType.RAND_STR]: 0,
};

export interface OperationRecord {
  id: string;
  type: OperationType;
  input: string[];
  result: string;
  createdDate: Date;
  cost: number;
  creditBalance: number;
}

export type OperationRecordAttribute = keyof OperationRecord;

export type SortDir = "asc" | "desc";
