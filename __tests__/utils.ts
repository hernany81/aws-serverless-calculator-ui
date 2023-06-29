import { addSeconds } from "date-fns";
import { OperationRecord, OperationType } from "../src/components/model/operations";

interface ManuallyResolvedPromiseResult<T> {
  promise: Promise<T>;
  resolveLater: (val: T) => void;
  rejectLater: (val: T) => void;
}

export function manuallyResolvedPromise<T>(): ManuallyResolvedPromiseResult<T> {
  let resolveLater = (val: T) => {};
  let rejectLater = (val: T) => {};

  const promise = new Promise<T>((resolve, reject) => {
    resolveLater = (v: T) => {
      resolve(v);
    };
    rejectLater = reject;
  });

  return { promise, resolveLater, rejectLater };
}

export const generateOperationRecords = (
  count: number,
  initialDate: Date,
  cost: number,
  initialCreditBalance: number,
): OperationRecord[] => {
  const records: OperationRecord[] = [];
  const operationTypes = Object.values(OperationType);
  let creditBalance = initialCreditBalance;

  for (let i = 0; i < count; i++) {
    const operationType = operationTypes[i % operationTypes.length];
    const input: string[] = [];

    switch (operationType) {
      case OperationType.ADD:
      case OperationType.SUBTRACT:
      case OperationType.MULTIPLY:
      case OperationType.DIVIDE:
        input.push(`input1-${i}`, `input2-${i}`);
        break;
      case OperationType.SQRT:
        input.push(`input1-${i}`);
        break;
    }

    const record: OperationRecord = {
      id: `id-${i}`,
      type: operationType,
      input: input,
      result: `result-${i}`,
      createdDate: addSeconds(initialDate, i),
      cost: cost,
      creditBalance: (creditBalance -= cost),
    };

    records.push(record);
  }

  return records;
};
