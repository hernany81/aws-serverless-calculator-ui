import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import { NotFoundPage } from "./NotFoundPage";

describe("NotFoundPage page", () => {
  test("Can be displayed successfully", () => {
    // arrange & act
    render(<NotFoundPage />);

    // assert
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });
});
