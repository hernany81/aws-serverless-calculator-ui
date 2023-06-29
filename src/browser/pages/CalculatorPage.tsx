import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import React, { useEffect, useState } from "react";
import { CalculationTriggered, Calculator } from "../../components/calculator/Calculator";
import { OperationResult } from "../../components/clients/calculatorClient";
import { Copyright } from "../../components/common/Copyright";
import { useAuthStore } from "../../components/hooks/useAuthStore";
import { useCreditBalanceStore } from "../../components/hooks/useCreditBalanceStore";
import useDependencies from "../../components/hooks/useDependencies";
import { useErrorStore } from "../../components/hooks/useErrorStore";
import { useOperationRecordsStore } from "../../components/hooks/useOperationRecordsStore";
import { OperationRecord, OperationRecordAttribute, OperationType, SortDir } from "../../components/model/operations";
import { OperationRecords } from "../../components/operationRecords/OperationRecords";
import { OperationRecordsFilterValues } from "../../components/operationRecords/OperationRecordsFilter";
import { Profile } from "../../components/profile/Profile";

export function CalculatorPage() {
  const { authClient, profileClient, calculatorClient, operationRecordsClient } = useDependencies();
  const { runAsyncCallback } = useErrorStore((state) => ({
    runCallback: state.runCallback,
    runAsyncCallback: state.runAsyncCallback,
  }));

  const [initialized, setInitialized] = useState(false);

  const { username, authToken, clearCredentials } = useAuthStore((state) => ({
    username: state.username,
    authToken: state.authToken,
    clearCredentials: state.clearCredentials,
  }));

  const { creditBalance, setCreditBalance } = useCreditBalanceStore((state) => ({
    creditBalance: state.creditBalance,
    setCreditBalance: state.setCreditBalance,
  }));

  const [operationRecordsGridLoading, setOperationRecordsGridLoading] = useState(false);

  const {
    records,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalRecords,
    orderBy,
    setOrderBy,
    sortDir,
    setSortDir,
    setOperationTypeFilter,
    setInputContainsFilter,
    setOutputContainsFilter,
    loadRecords,
  } = useOperationRecordsStore((state) => ({
    records: state.items,
    page: state.page,
    setPage: state.setPage,
    pageSize: state.pageSize,
    setPageSize: state.setPageSize,
    totalRecords: state.totalResults,
    orderBy: state.orderBy,
    setOrderBy: state.setOrderBy,
    sortDir: state.sortDir,
    setSortDir: state.setSortDir,
    setOperationTypeFilter: state.setOperationTypeFilter,
    setInputContainsFilter: state.setInputContainsFilter,
    setOutputContainsFilter: state.setOutputContainsFilter,
    loadRecords: state.loadRecords,
  }));

  useEffect(() => {
    if (!initialized) {
      runAsyncCallback(async () => {
        const creditBalance = await profileClient.getCreditBalance(authToken);
        setCreditBalance(creditBalance);
        await wrapLoadRecords();
        setInitialized(true);
      });
    }
  }, [initialized]);

  const handleSignOut = async () => {
    await runAsyncCallback(async () => {
      await authClient.signOut(authToken);
      clearCredentials();
    });
  };

  const handleCalculate = async ({ operationType, input1, input2 }: CalculationTriggered): Promise<string> => {
    let response: OperationResult = {
      result: "",
      creditBalance: 0,
    };

    await runAsyncCallback(async () => {
      switch (operationType) {
        case OperationType.ADD:
          response = await calculatorClient.add(authToken, input1, input2);
          break;
        case OperationType.SUBTRACT:
          response = await calculatorClient.subtract(authToken, input1, input2);
          break;
        case OperationType.MULTIPLY:
          response = await calculatorClient.multiply(authToken, input1, input2);
          break;
        case OperationType.DIVIDE:
          response = await calculatorClient.divide(authToken, input1, input2);
          break;
        case OperationType.SQRT:
          response = await calculatorClient.sqrt(authToken, input1);
          break;
        case OperationType.RAND_STR:
          response = await calculatorClient.randString(authToken);
          break;
      }

      setCreditBalance(response.creditBalance);
      wrapLoadRecords();
    });

    return response.result;
  };

  const wrapLoadRecords = async (): Promise<void> => {
    setOperationRecordsGridLoading(true);
    await runAsyncCallback(() => loadRecords(authToken, operationRecordsClient));
    setOperationRecordsGridLoading(false);
  };

  const handlePageChanged = (newPage: number): Promise<void> => {
    setPage(newPage);
    return wrapLoadRecords();
  };

  const handlePageSizeChanged = (newPageSize: number): Promise<void> => {
    setPageSize(newPageSize);
    setPage(0);
    return wrapLoadRecords();
  };

  const handleSortChanged = (newOrderBy: OperationRecordAttribute, newSortDir: SortDir): Promise<void> => {
    setOrderBy(newOrderBy);
    setSortDir(newSortDir);
    setPage(0);
    return wrapLoadRecords();
  };

  const handleFiltersApplied = async (appliedFilters: OperationRecordsFilterValues): Promise<void> => {
    setOperationTypeFilter(appliedFilters.operationType);
    setInputContainsFilter(appliedFilters.inputContains);
    setOutputContainsFilter(appliedFilters.outputContains);
    setPage(0);
    await wrapLoadRecords();
  };

  const handleDeleteRecord = async (record: OperationRecord): Promise<void> => {
    setOperationRecordsGridLoading(true);
    await runAsyncCallback(async () => {
      await operationRecordsClient.delete(authToken, record.id);
      if (records.length === 1 && page > 0) {
        // move one page back as it is the only record to delete in the page
        setPage(page - 1);
      }
      await wrapLoadRecords();
    });
    setOperationRecordsGridLoading(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Calculator */}
          <Grid item xs={12} md={8} lg={9}>
            <Paper
              elevation={12}
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 250,
              }}
            >
              <Calculator onCalculateTriggered={handleCalculate} />
            </Paper>
          </Grid>
          {/* Profile */}
          <Grid item xs={12} md={4} lg={3}>
            <Paper
              elevation={12}
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 250,
              }}
            >
              <Profile username={username} creditBalance={creditBalance} onSignOut={handleSignOut} />
            </Paper>
          </Grid>
          {/* Operation Records */}
          <Grid item xs={12}>
            <Paper elevation={12} sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <OperationRecords
                loading={operationRecordsGridLoading}
                records={records}
                page={page}
                pageSize={pageSize}
                totalRecords={totalRecords}
                orderBy={orderBy}
                sortDir={sortDir}
                onPageChange={(newPage) => handlePageChanged(newPage)}
                onPageSizeChange={(newPageSize) => handlePageSizeChanged(newPageSize)}
                onDeleteRecord={(rec) => handleDeleteRecord(rec)}
                onSortTriggered={(newOrderBy, newSortDir) => handleSortChanged(newOrderBy, newSortDir)}
                onFiltersApplied={(filters) => handleFiltersApplied(filters)}
              />
            </Paper>
          </Grid>
        </Grid>
        <Copyright color="text.secondary" sx={{ pt: 4 }} />
      </Container>
    </Box>
  );
}
