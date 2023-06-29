import {
  Button,
  CircularProgress,
  Grid,
  TextField,
  TextFieldProps,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Title } from "../common/Title";
import { OperationType, calculatorOperationRequiredInputsCfg } from "../model/operations";

type NumberInputProps = TextFieldProps & { onValidityChange?: (x: boolean) => void };

function NumberInput(props: NumberInputProps) {
  const [value, setValue] = useState("");
  const [isValid, setValid] = useState(false);
  const computeValidity = (val: string) => {
    const valid = val !== "";
    setValue(val);
    setValid(valid);

    if (props.onValidityChange) {
      props.onValidityChange(valid);
    }
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    computeValidity(event.target.value);

    if (props.onChange) {
      props.onChange(event);
    }
  };

  useEffect(() => computeValidity(value), [value]);

  const textInputProps = {
    ...props,
  };
  delete textInputProps.onValidityChange;

  return (
    <TextField
      {...textInputProps}
      type="number"
      value={value}
      onChange={(e) => handleChange(e)}
      required
      helperText={isValid ? "" : "This field is required"}
    />
  );
}

export interface CalculationTriggered {
  operationType: OperationType;
  input1: string;
  input2: string;
}

interface CalculatorProps {
  onCalculateTriggered: (event: CalculationTriggered) => Promise<string>;
}

export function Calculator({ onCalculateTriggered }: CalculatorProps) {
  const [operation, setOperation] = useState(OperationType.ADD);
  const [requiredInputs, setRequiredInputs] = useState(calculatorOperationRequiredInputsCfg[operation]);
  const [input1Valid, setInput1Valid] = useState(false);
  const [input2Valid, setInput2Valid] = useState(false);
  const [validForm, setValidForm] = useState(false);
  const [operationResult, setOperationResult] = useState("");
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangeOperation = (event: React.MouseEvent<HTMLElement>, newOperation: OperationType) => {
    if (newOperation && newOperation !== operation) {
      setOperation(newOperation);
      setRequiredInputs(calculatorOperationRequiredInputsCfg[newOperation]);
      setOperationResult("");
    }
  };

  const handleCalculate = async (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    if (validForm) {
      setLoading(true);
      const result = await onCalculateTriggered({
        operationType: operation,
        input1: input1,
        input2: input2,
      });
      setOperationResult(result);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requiredInputs === 1 && !input1Valid) {
      setValidForm(false);
    } else if (requiredInputs === 2 && (!input1Valid || !input2Valid)) {
      setValidForm(false);
    } else {
      setValidForm(true);
    }
  }, [requiredInputs, input1Valid, input2Valid]);

  const inputControls = [];

  if (requiredInputs > 0) {
    inputControls.push(
      <Grid item xs={4} sm={3} key="1">
        <NumberInput
          id="input1"
          label="Input 1"
          variant="outlined"
          size="small"
          value={input1}
          onChange={(e) => setInput1(e.target.value)}
          onValidityChange={setInput1Valid}
        />
      </Grid>,
    );
  }

  if (requiredInputs > 1) {
    inputControls.push(
      <Grid item xs={4} sm={3} key="2">
        <NumberInput
          id="input2"
          label="Input 2"
          variant="outlined"
          size="small"
          value={input2}
          onChange={(e) => setInput2(e.target.value)}
          onValidityChange={setInput2Valid}
        />
      </Grid>,
    );
  }

  return (
    <React.Fragment>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Title>Calculator</Title>
        </Grid>
        <Grid item>
          <ToggleButtonGroup
            size="small"
            color="primary"
            value={operation}
            exclusive
            onChange={handleChangeOperation}
            aria-label="Operation"
          >
            {Object.values(OperationType).map((x) => (
              <ToggleButton value={x} key={x}>
                {x}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Grid>
        <Grid
          item
          container
          direction="row"
          component="form"
          noValidate
          autoComplete="off"
          spacing={2}
          onSubmit={handleCalculate}
        >
          {inputControls.map((x) => x)}
          <Grid item xs={4} sm={3} sx={{ position: "relative" }}>
            <Button
              type="submit"
              data-testid="calculate-btn"
              fullWidth
              variant="contained"
              disabled={!validForm || loading}
            >
              Calculate
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  color: "primary",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: "-2px",
                  // marginLeft: "-12px",
                }}
              />
            )}
          </Grid>
        </Grid>
        <Grid item>
          <Typography data-testid="operation-result" component="p" variant="h4">
            {operationResult}
          </Typography>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
