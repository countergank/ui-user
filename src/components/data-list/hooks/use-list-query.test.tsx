import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import type { ListParams } from "../params";
import { useListQuery } from "./use-list-query";

const BASE: ListParams = {
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 20,
  filters: {},
};

function renderProbe() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  function Probe() {
    const [page, setPage] = useState(1);
    const query = useListQuery({
      queryKey: ["probe"],
      params: { ...BASE, page },
      queryFn: async (params) => {
        if (params.page > 1) {
          await new Promise((resolve) => setTimeout(resolve, 30));
        }

        return `data-${String(params.page)}`;
      },
    });

    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setPage(2);
          }}
        >
          next
        </button>
        <p>
          {query.isPlaceholderData ? `placeholder:${query.data}` : `data:${String(query.data)}`}
        </p>
      </div>
    );
  }

  render(
    <QueryClientProvider client={client}>
      <Probe />
    </QueryClientProvider>,
  );
}

describe("useListQuery", () => {
  it("keeps the previous page visible as placeholder while the next loads", async () => {
    renderProbe();

    expect(await screen.findByText("data:data-1")).toBeInTheDocument();

    act(() => {
      screen.getByRole("button", { name: "next" }).click();
    });

    await waitFor(() => {
      expect(screen.getByText("placeholder:data-1")).toBeInTheDocument();
    });
    expect(await screen.findByText("data:data-2")).toBeInTheDocument();
  });
});
