import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Profile } from "./Profile";

describe("Profile component", () => {
  test("Displays correct data", () => {
    // arrange
    const username = "Bill Murray";
    const creditBalance = 3.4567;
    const onSignOut = (): Promise<void> => Promise.resolve();

    // act
    render(
      <MemoryRouter>
        <Profile username={username} creditBalance={creditBalance} onSignOut={onSignOut} />
      </MemoryRouter>,
    );

    // assert
    expect(screen.getByTestId("username")).toHaveTextContent(username);
    expect(screen.getByTestId("credit-balance")).toHaveTextContent(creditBalance.toString());
  });

  test("Can sign out successfully", async () => {
    // arrange
    const onSignOut: () => Promise<void> = jest.fn(() => Promise.resolve());
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Profile username="Bill Murray" creditBalance={3.4567} onSignOut={onSignOut} />} />
          <Route path="/login" element={<div>this is login screen</div>} />
        </Routes>
      </MemoryRouter>,
    );

    // act
    fireEvent.click(screen.getByTestId("sign-out-btn"));

    // assert
    expect(onSignOut).toHaveBeenCalled();
    expect(await screen.findByText(/this is login screen/i)).toBeInTheDocument();
  });
});
