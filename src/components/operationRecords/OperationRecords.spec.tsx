import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { format } from "date-fns";
import React from "react";
import { generateOperationRecords } from "../../../__tests__/utils";
import { OperationRecord, OperationRecordAttribute, SortDir } from "../model/operations";
import { OperationRecords } from "./OperationRecords";

describe("OperationRecords component", () => {
  const records = generateOperationRecords(55, new Date("2023-06-25T10:00:00"), 5, 1000);

  test("Records and pagination information is successfully displayed", async () => {
    // arrange
    const slicedRecords = records.slice(10, 15);
    const noOpHandler = () => {
      throw new Error("Function not implemented.");
    };

    // act
    render(
      <OperationRecords
        records={slicedRecords}
        page={2}
        pageSize={10}
        totalRecords={records.length}
        orderBy="createdDate"
        sortDir="desc"
        loading={false}
        onPageChange={noOpHandler}
        onPageSizeChange={noOpHandler}
        onDeleteRecord={noOpHandler}
        onSortTriggered={noOpHandler}
        onFiltersApplied={noOpHandler}
      />,
    );

    // assert
    const assertColumnConfig = ({
      testId,
      label,
      sortable,
      sorted,
    }: {
      testId: string;
      label: string;
      sortable: boolean;
      sorted?: "ascending" | "descending";
    }) => {
      const columnHeader = screen.getByTestId(testId);

      expect(columnHeader).toHaveTextContent(label);

      if (sortable) {
        expect(columnHeader.querySelector("[data-testid=ArrowDownwardIcon]")).toBeInTheDocument();
      } else {
        expect(columnHeader.querySelector("[data-testid=ArrowDownwardIcon]")).not.toBeInTheDocument();
      }

      if (sorted) {
        expect(columnHeader).toHaveAttribute("aria-sort", sorted);
      } else {
        expect(columnHeader).not.toHaveAttribute("aria-sort");
      }
    };

    // Filters
    const filtersForm = screen.getByTestId("filters-form");
    expect(filtersForm).not.toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Filter list" }));
    expect(filtersForm).toBeVisible();
    expect(filtersForm.querySelector("button[type=submit]")).toHaveTextContent("Apply");

    // Table header
    assertColumnConfig({ testId: "executed-at-header", label: "Executed At", sortable: true, sorted: "descending" });
    assertColumnConfig({ testId: "operation-type-header", label: "Operation", sortable: true });
    assertColumnConfig({ testId: "operation-input-header", label: "Input", sortable: false });
    assertColumnConfig({ testId: "operation-output-header", label: "Output", sortable: true });
    assertColumnConfig({ testId: "operation-cost-header", label: "Cost", sortable: false });
    assertColumnConfig({ testId: "credit-balance-header", label: "Credit Balance", sortable: false });

    // Table content
    const tableRows = screen.getAllByTestId("data-row");
    expect(tableRows).toHaveLength(slicedRecords.length);
    tableRows.forEach((elem, index) => {
      const record = slicedRecords[index];
      expect(elem.querySelector("[data-testid=executed-at]")).toHaveTextContent(
        format(record.createdDate, "yyyy-MM-dd HH:mm"),
      );
      expect(elem.querySelector("[data-testid=operation-type]")).toHaveTextContent(record.type.toString());
      expect(elem.querySelector("[data-testid=operation-input]")).toHaveTextContent(record.input.join(", "));
      expect(elem.querySelector("[data-testid=operation-output]")).toHaveTextContent(record.result);
      expect(elem.querySelector("[data-testid=operation-cost]")).toHaveTextContent(record.cost.toString());
      expect(elem.querySelector("[data-testid=credit-balance]")).toHaveTextContent(record.creditBalance.toString());
      expect(elem.querySelector("[data-testid=actions] [data-testid=DeleteForeverIcon]")).toBeInTheDocument();
    });

    // Table pagination
    const tablePagination = screen.getByTestId("table-pagination");
    expect(tablePagination.querySelector(".MuiTablePagination-select")).toHaveTextContent("10");
    expect(tablePagination.querySelector(".MuiTablePagination-displayedRows")).toHaveTextContent(/21–30 of 55/);
    expect(tablePagination.querySelector('[aria-label="Go to previous page"]')).toBeEnabled();
    expect(tablePagination.querySelector('[aria-label="Go to next page"]')).toBeEnabled();
  });

  const pageNavigationParams = [
    { moveTo: "back", expectedPage: 1 },
    { moveTo: "next", expectedPage: 3 },
  ];

  test.each(pageNavigationParams)(
    "Navigating forward and backward through pages triggers the handler ($#)",
    async ({ moveTo, expectedPage }) => {
      // arrange
      const slicedRecords = records.slice(10, 15);
      const noOpHandler = () => {
        throw new Error("Function not implemented.");
      };
      const pageChangeHandler: () => void = jest.fn();

      render(
        <OperationRecords
          records={slicedRecords}
          page={2}
          pageSize={10}
          totalRecords={records.length}
          orderBy="createdDate"
          sortDir="desc"
          loading={false}
          onPageChange={pageChangeHandler}
          onPageSizeChange={noOpHandler}
          onDeleteRecord={noOpHandler}
          onSortTriggered={noOpHandler}
          onFiltersApplied={noOpHandler}
        />,
      );

      // act
      const tablePagination = screen.getByTestId("table-pagination");
      let navButtonSelector = '[aria-label="Go to previous page"]';
      if (moveTo === "next") {
        navButtonSelector = '[aria-label="Go to next page"]';
      }
      fireEvent.click(tablePagination.querySelector(navButtonSelector)!);

      expect(pageChangeHandler).toHaveBeenCalledWith(expectedPage);
    },
  );

  test.each([5, 15])("Changing page size triggers the handler", async (pageSize) => {
    // arrange
    const slicedRecords = records.slice(10, 15);
    const noOpHandler = () => {
      throw new Error("Function not implemented.");
    };
    const pageSizeChangeHandler: () => void = jest.fn();

    render(
      <OperationRecords
        records={slicedRecords}
        page={2}
        pageSize={10}
        totalRecords={records.length}
        orderBy="createdDate"
        sortDir="desc"
        loading={false}
        onPageChange={noOpHandler}
        onPageSizeChange={pageSizeChangeHandler}
        onDeleteRecord={noOpHandler}
        onSortTriggered={noOpHandler}
        onFiltersApplied={noOpHandler}
      />,
    );

    // act
    const tablePagination = screen.getByTestId("table-pagination");

    fireEvent.mouseDown(tablePagination.querySelector(".MuiTablePagination-select[role=button]")!);

    const pageSizeOption = screen
      .getByRole("presentation")
      .querySelector(`.MuiMenu-root [data-value="${pageSize}"].MuiTablePagination-menuItem`);

    expect(pageSizeOption).toBeInTheDocument();

    fireEvent.click(pageSizeOption!);

    // assert
    expect(pageSizeChangeHandler).toHaveBeenCalledWith(pageSize);
  });

  const sortingColumnsParams: {
    columnTestId: string;
    sortable: boolean;
    initialOrderBy: OperationRecordAttribute;
    initialSortDir: SortDir;
    expectedAttribute?: OperationRecordAttribute;
    expectedSortDir?: SortDir;
  }[] = [
    {
      columnTestId: "executed-at-header",
      sortable: true,
      initialOrderBy: "createdDate",
      initialSortDir: "desc",
      expectedAttribute: "createdDate",
      expectedSortDir: "asc",
    },
    {
      columnTestId: "executed-at-header",
      sortable: true,
      initialOrderBy: "createdDate",
      initialSortDir: "asc",
      expectedAttribute: "createdDate",
      expectedSortDir: "desc",
    },
    {
      columnTestId: "operation-type-header",
      sortable: true,
      initialOrderBy: "createdDate",
      initialSortDir: "desc",
      expectedAttribute: "type",
      expectedSortDir: "asc",
    },
    { columnTestId: "operation-input-header", sortable: false, initialOrderBy: "createdDate", initialSortDir: "desc" },
    {
      columnTestId: "operation-output-header",
      sortable: true,
      initialOrderBy: "createdDate",
      initialSortDir: "desc",
      expectedAttribute: "result",
      expectedSortDir: "asc",
    },
    { columnTestId: "operation-cost-header", sortable: false, initialOrderBy: "createdDate", initialSortDir: "desc" },
    { columnTestId: "credit-balance-header", sortable: false, initialOrderBy: "createdDate", initialSortDir: "desc" },
  ];

  test.each(sortingColumnsParams)(
    "Sorting of columns triggers the handler ($columnTestId)[$#]",
    ({ initialOrderBy, initialSortDir, columnTestId, sortable, expectedAttribute, expectedSortDir }) => {
      // arrange
      const slicedRecords = records.slice(10, 15);
      const noOpHandler = () => {
        throw new Error("Function not implemented.");
      };
      const sortHandler: (orderBy: OperationRecordAttribute, sortDir: SortDir) => void = jest.fn();

      render(
        <OperationRecords
          records={slicedRecords}
          page={2}
          pageSize={10}
          totalRecords={records.length}
          orderBy={initialOrderBy}
          sortDir={initialSortDir}
          loading={false}
          onPageChange={noOpHandler}
          onPageSizeChange={noOpHandler}
          onDeleteRecord={noOpHandler}
          onSortTriggered={sortHandler}
          onFiltersApplied={noOpHandler}
        />,
      );

      // act
      const columnHeader = screen.getByTestId(columnTestId);
      const sortBtn = columnHeader.querySelector("[role=button]");

      if (sortBtn) {
        fireEvent.click(sortBtn);
      }

      // assert
      if (!sortable) {
        expect(sortHandler).not.toHaveBeenCalled();
        return;
      }

      expect(sortHandler).toHaveBeenCalledWith(expectedAttribute, expectedSortDir!);
    },
  );

  test("Deleting a record triggers the handler", () => {
    // arrange
    const slicedRecords = records.slice(10, 15);
    const noOpHandler = () => {
      throw new Error("Function not implemented.");
    };
    const handleDeleteRecord: (record: OperationRecord) => void = jest.fn();

    render(
      <OperationRecords
        records={slicedRecords}
        page={2}
        pageSize={10}
        totalRecords={records.length}
        orderBy="createdDate"
        sortDir="desc"
        loading={false}
        onPageChange={noOpHandler}
        onPageSizeChange={noOpHandler}
        onDeleteRecord={handleDeleteRecord}
        onSortTriggered={noOpHandler}
        onFiltersApplied={noOpHandler}
      />,
    );

    const selectedRecord = slicedRecords[3];
    const tableBody = screen.getByTestId("table-body");

    // act
    fireEvent.click(
      tableBody.querySelector(
        `[data-testid=data-row][data-rowid="${selectedRecord.id}"] [data-testid=actions] button`,
      )!,
    );

    // assert
    expect(handleDeleteRecord).toHaveBeenCalledWith(selectedRecord);
  });
});
