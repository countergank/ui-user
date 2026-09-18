// Route module coverage (STACK-7, ARCH-5): the data router is constructed at
// module scope and each lazy route module exports a renderable `Component`.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Component as AboutRoute } from "./about-route";
import { Component as HomeRoute } from "./home-route";
import { router } from "./index";

describe("routes", () => {
  it("exports a browser router with an app shell root and two child routes", () => {
    const first = router.routes[0];
    expect(first.path).toBe("/");
    expect(first.children).toHaveLength(2);
  });

  it("renders the lazy home route component", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <HomeRoute />
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("heading", { name: /standard frontend template/i }),
    ).toBeInTheDocument();
  });

  it("renders the lazy about route component", () => {
    render(<AboutRoute />);
    expect(screen.getByRole("heading", { name: "About" })).toBeInTheDocument();
    expect(screen.getByText(/feature-based \(screaming\)/i)).toBeInTheDocument();
  });
});
