import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "@testing-library/react-hooks";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { useErrorStore } from "../components/hooks/useErrorStore";
import App from "./App";
import { ErrorPage } from "./pages/ErrorPage";
import { LoginPage } from "./pages/LoginPage";

jest.mock("../components/ConfigContext");

jest.mock("./pages/LoginPage", () => ({
  LoginPage: jest.fn(() => <div>This is the login page</div>),
}));
const mockedLoginPage = jest.mocked(LoginPage);

jest.mock("./pages/ErrorPage", () => ({
  ErrorPage: jest.fn(() => <div>This is the default error page</div>),
}));
const mockedErrorPage = jest.mocked(ErrorPage);
const initialErrorStoreState = useErrorStore.getState();

describe("App page", () => {
  beforeEach(() => {
    act(() => useErrorStore.setState(initialErrorStoreState));
  });

  afterEach(() => {
    act(() => useErrorStore.setState(initialErrorStoreState));
  });

  test("renders without crashing", () => {
    // arrange
    // act
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
    );

    // assert
    expect(mockedLoginPage).toHaveBeenCalled();
    expect(screen.getByText("This is the login page")).toBeInTheDocument();
  });

  test("Rendering errors activates ErrorPage", () => {
    // arrange
    jest.mocked(LoginPage).mockImplementationOnce(() => {
      throw Error("Boom!");
    });

    // act
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
    );

    // assert
    expect(mockedLoginPage).toHaveBeenCalled();
    expect(screen.getByText("This is the default error page")).toBeInTheDocument();
  });

  test("Async errors activates AsyncErrorPage", async () => {
    // arrange
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
    );

    // act
    act(() => {
      useErrorStore.getState().runCallback(() => {
        throw Error("Boom!");
      });
    });

    // assert
    await waitFor(() => {
      expect(screen.getByText("We are sorry but an unexpected error happened")).toBeInTheDocument();
    });
  });
});
