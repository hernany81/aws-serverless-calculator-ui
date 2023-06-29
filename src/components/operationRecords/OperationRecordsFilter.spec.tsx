import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { OperationType } from "../model/operations";
import { OperationRecordsFilter, OperationRecordsFilterValues } from "./OperationRecordsFilter";

describe("OperationRecordsFilter component", () => {
  test("All fields are correctly displayed", () => {
    // arrange & act
    render(<OperationRecordsFilter onFilterApplied={() => {}} />);

    // assert
    const filtersForm = screen.getByTestId("filters-form");
    expect(filtersForm.querySelector("#operation-type + input")).toHaveValue("ALL");
    expect(filtersForm.querySelector("input#inputContains")).toBeInTheDocument();
    expect(filtersForm.querySelector("input#outputContains")).toBeInTheDocument();
    expect(filtersForm.querySelector("button[type=submit]")).toHaveTextContent("Apply");
    expect(filtersForm.querySelector("button[type=button]")).toHaveTextContent("Clear");
  });

  const filterRecordsParams: OperationRecordsFilterValues[] = [
    {
      operationType: "ALL",
      inputContains: "",
      outputContains: "",
    },
    {
      operationType: OperationType.ADD,
      inputContains: "2",
      outputContains: "asd",
    },
  ];

  test.each(filterRecordsParams)(
    "Filtering records triggers the handler ($#)",
    ({ operationType, inputContains, outputContains }) => {
      // arrange
      const handleFiltersApplied: (filters: OperationRecordsFilterValues) => void = jest.fn();

      render(<OperationRecordsFilter onFilterApplied={handleFiltersApplied} />);
      const filtersForm = screen.getByTestId("filters-form");

      // act
      // Filters
      fireEvent.mouseDown(filtersForm.querySelector("[role=button][aria-labelledby~=operation-type]")!);

      const selectionPopup = screen.getByRole("presentation");
      fireEvent.click(selectionPopup.querySelector(`li[role=option][data-value=${operationType}]`)!);
      fireEvent.change(filtersForm.querySelector("input#inputContains")!, { target: { value: inputContains } });
      fireEvent.change(filtersForm.querySelector("input#outputContains")!, { target: { value: outputContains } });
      fireEvent.click(filtersForm.querySelector("button[type=submit]")!);

      // assert
      expect(handleFiltersApplied).toHaveBeenCalledWith({ operationType, inputContains, outputContains });
    },
  );

  test("Clearing the filter records triggers the handler", () => {
    // arrange
    const handleFiltersApplied: (filters: OperationRecordsFilterValues) => void = jest.fn();

    render(<OperationRecordsFilter onFilterApplied={handleFiltersApplied} />);
    const filtersForm = screen.getByTestId("filters-form");
    fireEvent.mouseDown(filtersForm.querySelector("[role=button][aria-labelledby~=operation-type]")!);

    const selectionPopup = screen.getByRole("presentation");
    fireEvent.click(selectionPopup.querySelector(`li[role=option][data-value="SQRT"]`)!);
    fireEvent.change(filtersForm.querySelector("input#inputContains")!, { target: { value: "hello" } });
    fireEvent.change(filtersForm.querySelector("input#outputContains")!, { target: { value: "world!" } });

    // act
    fireEvent.click(filtersForm.querySelector("button[type=button][data-testid=clear-btn]")!);

    // assert
    expect(handleFiltersApplied).toHaveBeenCalledWith({ operationType: "ALL", inputContains: "", outputContains: "" });
  });
});
