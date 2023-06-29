import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import React, { FormEvent, useState } from "react";
import { OperationType } from "../model/operations";

export interface OperationRecordsFilterValues {
  operationType: OperationType | "ALL";
  inputContains: string;
  outputContains: string;
}

interface OperationRecordsFilterProps {
  onFilterApplied(filterValues: OperationRecordsFilterValues): void;
}

export function OperationRecordsFilter({ onFilterApplied }: OperationRecordsFilterProps) {
  const [operationType, setOperationType] = useState<OperationType | "ALL">("ALL");
  const [inputContains, setInputContains] = useState("");
  const [outputContains, setOutputContains] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onFilterApplied({ operationType, inputContains, outputContains });
  };

  const handleClear = (): void => {
    setOperationType("ALL");
    setInputContains("");
    setOutputContains("");
    onFilterApplied({ operationType: "ALL", inputContains: "", outputContains: "" });
  };

  return (
    <React.Fragment>
      <Grid
        container
        direction="column"
        component="form"
        data-testid="filters-form"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
        spacing={2}
        margin={1}
      >
        <Stack direction="row" spacing={2}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="operation-type-label">Operation</InputLabel>
            <Select
              labelId="operation-type-label"
              id="operation-type"
              value={operationType}
              label="Operation"
              onChange={(e) => setOperationType(e.target.value as OperationType)}
            >
              <MenuItem value="ALL">ALL</MenuItem>
              {Object.values(OperationType).map((x) => (
                <MenuItem value={x} key={x}>
                  {x}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small">
            <TextField
              size="small"
              fullWidth
              id="inputContains"
              label="Input Contains"
              name="inputContains"
              value={inputContains}
              onChange={(e) => setInputContains(e.target.value)}
            />
          </FormControl>
          <FormControl size="small">
            <TextField
              size="small"
              fullWidth
              id="outputContains"
              label="Result Contains"
              name="outputContains"
              value={outputContains}
              onChange={(e) => setOutputContains(e.target.value)}
            />
          </FormControl>
          <FormControl size="small">
            <Button type="submit" fullWidth variant="contained">
              Apply
            </Button>
          </FormControl>
          <FormControl size="small">
            <Button type="button" fullWidth onClick={handleClear} data-testid="clear-btn">
              Clear
            </Button>
          </FormControl>
        </Stack>
      </Grid>
    </React.Fragment>
  );
}
