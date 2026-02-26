import { render, screen } from "@testing-library/react";

import Home from "./page";

describe("Home page", () => {
  it("renders AI chat heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /ai chat/i,
      })
    ).toBeInTheDocument();
  });
});
