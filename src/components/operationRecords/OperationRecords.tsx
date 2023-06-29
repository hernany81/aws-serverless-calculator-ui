import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  Backdrop,
  Box,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  Paper,
  SortDirection,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { format } from "date-fns";
import React, { useState } from "react";
import { Title } from "../common/Title";
import { OperationRecord, OperationRecordAttribute, SortDir } from "../model/operations";
import { OperationRecordsFilter, OperationRecordsFilterValues } from "./OperationRecordsFilter";

interface HeadCell {
  id: OperationRecordAttribute;
  label: string;
  sortable: boolean;
  align: "left" | "right";
  testId: string;
}

const headCells: readonly HeadCell[] = [
  {
    id: "createdDate",
    label: "Executed At",
    sortable: true,
    align: "right",
    testId: "executed-at-header",
  },
  {
    id: "type",
    label: "Operation",
    sortable: true,
    align: "right",
    testId: "operation-type-header",
  },
  {
    id: "input",
    label: "Input",
    sortable: false,
    align: "right",
    testId: "operation-input-header",
  },
  {
    id: "result",
    label: "Output",
    sortable: true,
    align: "right",
    testId: "operation-output-header",
  },
  {
    id: "cost",
    label: "Cost",
    sortable: false,
    align: "right",
    testId: "operation-cost-header",
  },
  {
    id: "creditBalance",
    label: "Credit Balance",
    sortable: false,
    align: "right",
    testId: "credit-balance-header",
  },
];

export interface OperationRecordsProps {
  records: OperationRecord[];
  page: number;
  pageSize: number;
  totalRecords: number;
  orderBy: OperationRecordAttribute;
  sortDir: SortDir;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onDeleteRecord: (record: OperationRecord) => void;
  onSortTriggered: (orderBy: OperationRecordAttribute, sortDir: SortDir) => void;
  onFiltersApplied: (values: OperationRecordsFilterValues) => void;
}

type EnhancedTableHeadProps = Pick<OperationRecordsProps, "orderBy" | "sortDir"> & {
  onSortTriggered: (orderBy: OperationRecordAttribute, sortDir: SortDir) => void;
};

function EnhancedTableHead({ orderBy, sortDir, onSortTriggered }: EnhancedTableHeadProps) {
  const getSortDirection = (cfg: HeadCell): SortDirection | undefined => {
    let sortDirection: SortDirection | undefined;

    if (cfg.sortable) {
      sortDirection = orderBy === cfg.id ? sortDir : false;
    }

    return sortDirection;
  };

  const handleSort = (colHead: HeadCell) => {
    let newSortDir: SortDir = "asc";
    if (orderBy === colHead.id) {
      newSortDir = sortDir === "asc" ? "desc" : "asc";
    }
    onSortTriggered(colHead.id, newSortDir);
  };

  return (
    <TableHead>
      <TableRow data-testid="header-row">
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            data-testid={headCell.testId}
            align={headCell.align}
            sortDirection={getSortDirection(headCell)}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? sortDir : "asc"}
                onClick={() => handleSort(headCell)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {sortDir === "desc" ? "sorted descending" : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
        <TableCell align="right" data-testid="actions">
          &nbsp;
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

export function OperationRecords({
  records,
  page,
  pageSize,
  totalRecords,
  orderBy,
  sortDir,
  loading,
  onPageChange,
  onPageSizeChange,
  onDeleteRecord,
  onSortTriggered,
  onFiltersApplied,
}: OperationRecordsProps) {
  const [isFilterOpen, setFilterOpen] = useState(false);

  return (
    <React.Fragment>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container direction="column" spacing={2}>
        <Grid container item direction="row">
          <Grid item xs={11}>
            <Title>Operation Records</Title>
          </Grid>
          <Grid item xs={1} textAlign="right">
            <Tooltip title="Filter list">
              <IconButton onClick={() => setFilterOpen(!isFilterOpen)}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
        <Grid item sx={{ paddingTop: "0px !important" }}>
          <Collapse in={isFilterOpen}>
            <OperationRecordsFilter onFilterApplied={(e) => onFiltersApplied(e)} />
          </Collapse>
        </Grid>
        <Grid item>
          <TableContainer component={Paper}>
            <Table size="small">
              <EnhancedTableHead
                orderBy={orderBy}
                sortDir={sortDir}
                onSortTriggered={(reqOrderBy, reqSortDir) => onSortTriggered(reqOrderBy, reqSortDir)}
              />
              <TableBody data-testid="table-body">
                {records.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    data-testid="data-row"
                    data-rowid={row.id}
                  >
                    <TableCell align="right" data-testid="executed-at">
                      {format(row.createdDate, "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell align="right" data-testid="operation-type">
                      {row.type}
                    </TableCell>
                    <TableCell align="right" data-testid="operation-input">
                      {row.input.join(", ")}
                    </TableCell>
                    <TableCell align="right" data-testid="operation-output">
                      {row.result}
                    </TableCell>
                    <TableCell align="right" data-testid="operation-cost">
                      {row.cost}
                    </TableCell>
                    <TableCell align="right" data-testid="credit-balance">
                      {row.creditBalance}
                    </TableCell>
                    <TableCell align="right" data-testid="actions">
                      <IconButton onClick={() => onDeleteRecord(row)} size="small" sx={{ padding: "1px" }}>
                        <DeleteForeverIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 15]}
            component="div"
            count={totalRecords}
            rowsPerPage={pageSize}
            page={page}
            onPageChange={(e, page) => onPageChange(page)}
            onRowsPerPageChange={(ev) => onPageSizeChange(parseInt(ev.target.value))}
            data-testid="table-pagination"
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
