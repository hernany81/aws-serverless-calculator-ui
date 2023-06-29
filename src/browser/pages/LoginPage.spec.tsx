import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "@testing-library/react-hooks";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthClient } from "src/components/clients/authClient";
import { DependenciesContainer, DependenciesContext } from "../../components/di/DependenciesContext";
import { useAuthStore } from "../../components/hooks/useAuthStore";
import { SignIn } from "../../components/login/SignIn";
import { LoginPage } from "./LoginPage";

jest.mock("../../components/login/SignIn", () => ({
  SignIn: jest.fn(() => <div>Sign-In</div>),
}));

const mockedSignIn = jest.mocked(SignIn);
const originalAuthStoreState = useAuthStore.getState();
const authClientMock: AuthClient = {
  signIn: jest.fn(),
  signOut: jest.fn(),
};

const dependenciesContainer: DependenciesContainer = {
  authClient: authClientMock,
  calculatorClient: {
    add: () => {
      throw new Error("Function not implemented.");
    },
    subtract: () => {
      throw new Error("Function not implemented.");
    },
    multiply: () => {
      throw new Error("Function not implemented.");
    },
    divide: () => {
      throw new Error("Function not implemented.");
    },
    sqrt: () => {
      throw new Error("Function not implemented.");
    },
    randString: () => {
      throw new Error("Function not implemented.");
    },
  },
  operationRecordsClient: {
    getRecords: () => {
      throw new Error("Function not implemented.");
    },
    delete: () => {
      throw new Error("Function not implemented.");
    },
  },
  profileClient: {
    getCreditBalance: () => {
      throw new Error("Function not implemented.");
    },
  },
};

describe("LoginPage page", () => {
  beforeEach(() => {
    // Restore initial state
    act(() => useAuthStore.setState(originalAuthStoreState));
  });

  afterEach(() => {
    // Restore initial state
    act(() => useAuthStore.setState(originalAuthStoreState));
  });

  test("If there is already an auth token when the page is loaded then navigate to homepage", async () => {
    // arrange
    act(() => {
      useAuthStore.setState({
        authToken: "auth-token",
      });
    });

    // act
    render(
      <DependenciesContext.Provider value={dependenciesContainer}>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/" element={<div>This is the homepage</div>} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </DependenciesContext.Provider>,
    );

    // assert
    await waitFor(() => {
      expect(screen.getByText("This is the homepage")).toBeInTheDocument();
    });
  });

  test("Handler will invoke the sign in method in authStore and display the error message", async () => {
    // arrange
    const signInCallMock = jest.mocked(authClientMock.signIn);
    signInCallMock.mockRejectedValue(Error("Boom!"));

    act(() => {
      useAuthStore.setState({
        authToken: "",
      });
    });

    render(
      <DependenciesContext.Provider value={dependenciesContainer}>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </DependenciesContext.Provider>,
    );

    // act
    const signInPropsCalls = jest.mocked(mockedSignIn).mock.calls;
    let signInResult: boolean = false;
    await act(async () => {
      signInResult = await signInPropsCalls[0][0].onSubmit("Bill", "Murray");
    });

    // assert
    expect(signInResult).toBe(false);
    expect(signInCallMock).toHaveBeenCalledWith("Bill", "Murray");
    expect(signInPropsCalls[1][0].errorMsg).toEqual("Cannot authenticate user");
  });
});
