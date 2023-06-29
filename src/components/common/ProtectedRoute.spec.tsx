import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "@testing-library/react-hooks";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../../components/hooks/useAuthStore";
import { ProtectedRoute } from "./ProtectedRoute";

const originalAuthStoreState = useAuthStore.getState();

describe("ProtectedRoute component", () => {
  beforeEach(() => {
    // Restore initial state
    act(() => useAuthStore.setState(originalAuthStoreState));
  });

  afterEach(() => {
    // Restore initial state
    act(() => useAuthStore.setState(originalAuthStoreState));
  });

  test("If no auth token available then navigate to /login", async () => {
    // arrange
    act(() =>
      useAuthStore.setState({
        ...originalAuthStoreState,
        authToken: "",
      }),
    );

    // act
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>This is the protected page</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>This is the login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    // assert
    await waitFor(() => {
      expect(screen.getByText("This is the login page")).toBeInTheDocument();
    });
  });

  test("If auth token then display children content", async () => {
    // arrange
    act(() =>
      useAuthStore.setState({
        ...originalAuthStoreState,
        authToken: "auth-token",
      }),
    );

    // act
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>This is the protected page</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>This is the login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    // assert
    await waitFor(() => {
      expect(screen.getByText("This is the protected page")).toBeInTheDocument();
    });
  });
});
