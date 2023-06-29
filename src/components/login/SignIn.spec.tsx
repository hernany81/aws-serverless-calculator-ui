import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { manuallyResolvedPromise } from "../../../__tests__/utils";
import { SignIn } from "./SignIn";

describe("SignIn component", () => {
  const emptyUsernameOrPasswordParams = [
    {
      email: "",
      password: "",
    },
    {
      email: "user",
      password: "",
    },
    {
      email: "",
      password: "pass",
    },
  ];
  test.each(emptyUsernameOrPasswordParams)("Cannot submit with empty email or password [$#]", ({ email, password }) => {
    // arrange
    const errorMsg = "";
    const onSubmit = (username: string, password: string): Promise<boolean> => Promise.resolve(false);

    render(
      <MemoryRouter>
        <SignIn errorMsg={errorMsg} onSubmit={onSubmit} />
      </MemoryRouter>,
    );

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.change(passwordInput, { target: { value: password } });

    // act & assert
    const submitBtn = screen.getByTestId("sign-in");
    expect(submitBtn).toBeDisabled();
    expect(emailInput).toHaveValue(email);
    expect(passwordInput).toHaveValue(password);

    submitBtn.click();
    expect(submitBtn).toBeDisabled();
  });

  test("When submitting with username and password onSubmit callback is invoked loading icon is displayed", () => {
    // arrange
    const errorMsg = "";
    const onSubmit = (username: string, password: string): Promise<boolean> => new Promise(() => {});

    render(
      <MemoryRouter>
        <SignIn errorMsg={errorMsg} onSubmit={onSubmit} />
      </MemoryRouter>,
    );

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: "John" } });
    fireEvent.change(passwordInput, { target: { value: "Doe" } });
    const submitBtn = screen.getByTestId("sign-in");
    expect(submitBtn).toBeEnabled();

    // act
    submitBtn.click();

    // assert
    expect(submitBtn).toBeDisabled();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("On failed authentication enables the button", async () => {
    // arrange
    const errorMsg = "";
    const manualPromise = manuallyResolvedPromise<boolean>();
    const onSubmit = (username: string, password: string): Promise<boolean> => manualPromise.promise;

    render(
      <MemoryRouter>
        <SignIn errorMsg={errorMsg} onSubmit={onSubmit} />
      </MemoryRouter>,
    );

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: "John" } });
    fireEvent.change(passwordInput, { target: { value: "Doe" } });
    const submitBtn = screen.getByTestId("sign-in");
    expect(submitBtn).toBeEnabled();
    submitBtn.click();
    expect(submitBtn).toBeDisabled();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    // act
    act(() => manualPromise.resolveLater(false));

    // assert
    await waitFor(() => {
      expect(submitBtn).toBeEnabled();
      expect(screen.queryByRole("progressbar")).toBeNull();
    });
  });

  test("On success authentication navigates to homepage", async () => {
    // arrange
    const errorMsg = "";
    const onSubmit = (username: string, password: string): Promise<boolean> => Promise.resolve(true);

    render(
      <MemoryRouter initialEntries={["/", "/login"]}>
        <Routes>
          <Route path="/" element={<div>This is the homepage</div>} />
          <Route path="/login" element={<SignIn errorMsg={errorMsg} onSubmit={onSubmit} />} />
        </Routes>
      </MemoryRouter>,
    );

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: "John" } });
    fireEvent.change(passwordInput, { target: { value: "Doe" } });

    // act
    const submitBtn = screen.getByTestId("sign-in");
    submitBtn.click();

    // assert
    expect(await screen.findByText(/homepage/i)).toBeInTheDocument();
  });
});
