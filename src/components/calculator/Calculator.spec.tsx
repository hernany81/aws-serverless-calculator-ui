import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { CalculationTriggered, Calculator } from "./Calculator";

describe("Calculator component", () => {
  const operationRequiredInputsParams = [
    {
      operation: "ADD",
      requiredInputs: 2,
    },
    {
      operation: "SUBTRACT",
      requiredInputs: 2,
    },
    {
      operation: "MULTIPLY",
      requiredInputs: 2,
    },
    {
      operation: "DIVIDE",
      requiredInputs: 2,
    },
    {
      operation: "SQRT",
      requiredInputs: 1,
    },
    {
      operation: "RAND_STR",
      requiredInputs: 0,
    },
  ];

  test.each(operationRequiredInputsParams)(
    "Selected operation displays the proper number of inputs ($operation)",
    ({ operation, requiredInputs }) => {
      // arrange
      const onCalculate: (event: CalculationTriggered) => Promise<string> = jest.fn();
      render(<Calculator onCalculateTriggered={onCalculate} />);

      // act
      fireEvent.click(screen.getByText(operation, { selector: "button" }));

      // assert
      expect(screen.queryAllByRole("spinbutton")).toHaveLength(requiredInputs);

      if (requiredInputs > 0) {
        expect(screen.getByTestId("calculate-btn")).toBeDisabled();
      } else {
        expect(screen.getByTestId("calculate-btn")).toBeEnabled();
      }
    },
  );

  const operationWithValidInputsParams = [
    {
      operation: "ADD",
      inputs: ["", ""],
    },
    {
      operation: "ADD",
      inputs: ["a", "2"],
    },
    {
      operation: "ADD",
      inputs: ["3", ".2.1"],
    },
    {
      operation: "SQRT",
      inputs: ["3a"],
    },
    {
      operation: "SQRT",
      inputs: [".1."],
    },
  ];

  test.each(operationWithValidInputsParams)(
    "If number of inputs does not contain valid data the button is disabled ($operation - $inputs)",
    ({ operation, inputs }) => {
      // arrange
      const onCalculate: (event: CalculationTriggered) => Promise<string> = jest.fn();
      render(<Calculator onCalculateTriggered={onCalculate} />);
      fireEvent.click(screen.getByText(operation, { selector: "button" }));

      // act
      const numberInputs = screen.queryAllByRole("spinbutton");
      for (let i = 0; i < inputs.length; i++) {
        fireEvent.change(numberInputs[i], { target: { value: inputs[i] } });
      }

      // assert
      expect(screen.getByTestId("calculate-btn")).toBeDisabled();
    },
  );

  const successOperationParams = [
    {
      operation: "ADD",
      inputs: ["3.5", "1.5"],
      result: "5",
    },
    {
      operation: "DIVIDE",
      inputs: ["15", "2"],
      result: "7.5",
    },
    {
      operation: "SQRT",
      inputs: ["12.25"],
      result: "3.5",
    },
    {
      operation: "RAND_STR",
      inputs: [],
      result: "ABCDEFG",
    },
  ];

  test.each(successOperationParams)(
    "A successful operation displays the result ($operation - $inputs)",
    async ({ operation, inputs, result }) => {
      // arrange
      const onCalculate: (event: CalculationTriggered) => Promise<string> = jest.fn(() => Promise.resolve(result));
      render(<Calculator onCalculateTriggered={onCalculate} />);
      fireEvent.click(screen.getByText(operation, { selector: "button" }));
      const numberInputs = screen.queryAllByRole("spinbutton");
      for (let i = 0; i < inputs.length; i++) {
        fireEvent.change(numberInputs[i], { target: { value: inputs[i] } });
      }

      // act
      fireEvent.click(screen.getByTestId("calculate-btn"));

      // assert
      await waitFor(() => {
        expect(screen.getByTestId("operation-result")).toHaveTextContent(new RegExp(`^${result}$`));
      });
    },
  );
});
