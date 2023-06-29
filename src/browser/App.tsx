import { CssBaseline } from "@mui/material";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Route, Routes } from "react-router-dom";
import { AsyncErrorDialog } from "../components/common/AsyncErrorDialog";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import useConfig from "../components/hooks/useConfig";
import "./App.css";
import { CalculatorPage } from "./pages/CalculatorPage";
import { ErrorPage } from "./pages/ErrorPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";

/**
 * Our Web Application
 */
export default function App() {
  const config = useConfig();

  return (
    <div>
      <CssBaseline />

      <ErrorBoundary fallbackRender={ErrorPage}>
        <AsyncErrorDialog />
        <Routes>
          <Route
            path="/"
            index
            element={
              <ProtectedRoute>
                <CalculatorPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={NotFoundPage()} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}
