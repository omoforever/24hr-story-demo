import { render, screen } from "@testing-library/react";
import { Providers } from "./providers";
import Home from "./page";

describe("Home", () => {
  it("renders the page heading", () => {
    render(
      <Providers>
        <Home />
      </Providers>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "24hr Stories" }),
    ).toBeInTheDocument();
  });
});
