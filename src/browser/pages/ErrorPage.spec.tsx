import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ErrorPage } from "./ErrorPage";

describe("ErrorPage page", () => {
  test("Can be displayed successfully", () => {
    // arrange
    const error = new Error("Boom!");

    // act
    render(<ErrorPage error={error} resetErrorBoundary={() => {}} />);

    // assert
    expect(screen.getByText("Ups, this is embarrassing!")).toBeInTheDocument();
  });

  test("Can click on the try again button", () => {
    // arrange
    const error = new Error("Boom!");
    const handler = jest.fn();
    render(<ErrorPage error={error} resetErrorBoundary={handler} />);

    // act
    const tryAgainBtn = screen.getByRole("button");
    fireEvent.click(tryAgainBtn);

    // assert
    expect(handler).toHaveBeenCalled();
  });
});
