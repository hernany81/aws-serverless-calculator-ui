import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "@testing-library/react-hooks";
import { AxiosError, AxiosHeaders } from "axios";
import React from "react";
import { useAuthStore } from "../hooks/useAuthStore";
import { useErrorStore } from "../hooks/useErrorStore";
import { AsyncErrorDialog } from "./AsyncErrorDialog";

const initialErrorStoreState = useErrorStore.getState();
const initialAuthStoreState = useAuthStore.getState();

describe("AsyncErrorDialog component", () => {
  beforeEach(() => {
    act(() => {
      useErrorStore.setState(initialErrorStoreState);
      useAuthStore.setState(initialAuthStoreState);
    });
  });

  afterEach(() => {
    act(() => {
      useErrorStore.setState(initialErrorStoreState);
      useAuthStore.setState(initialAuthStoreState);
    });
  });

  test("Generic error displays default message", async () => {
    // arrange
    render(
      <div>
        <AsyncErrorDialog />
      </div>,
    );

    useErrorStore.getState().runAsyncCallback(async () => {
      throw Error("Boom!");
    });

    // assert
    await waitFor(() => {
      expect(screen.getByText("We are sorry but an unexpected error happened")).toBeInTheDocument();
    });
  });

  test("401 http error displays a dialog that will clean up stored credentials", async () => {
    // arrange
    const clearCredentialsCallMock = jest.fn();

    useAuthStore.setState({
      ...initialAuthStoreState,
      clearCredentials: clearCredentialsCallMock,
    });

    render(
      <div>
        <AsyncErrorDialog />
      </div>,
    );

    useErrorStore.getState().runAsyncCallback(async () => {
      throw AxiosError.from(Error("Boom!"), undefined, undefined, undefined, {
        data: "",
        status: 401,
        statusText: "Unauthenticated",
        headers: {},
        config: {
          headers: new AxiosHeaders(),
        },
      });
    });

    // assert
    await waitFor(() => {
      expect(
        screen.getByText(/Seems your credential is no longer valid. Please try to sign\-in again/),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("async-error-dialog").querySelector("button")!);

    expect(clearCredentialsCallMock).toHaveBeenCalled();
  });
});
