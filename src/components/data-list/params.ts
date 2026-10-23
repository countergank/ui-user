export type SortOrder = "asc" | "desc";

export interface FilterSpec {
  name: string;
  values?: readonly string[];
}

export interface ListParamsConfig {
  limit: number;
  sortFields: readonly string[];
  defaultSortBy: string;
  defaultSortOrder: SortOrder;
  filters: readonly FilterSpec[];
}

export interface ListParams {
  sortBy: string;
  sortOrder: SortOrder;
  page: number;
  limit: number;
  filters: Readonly<Record<string, string | undefined>>;
}

export function defaultListParams(config: ListParamsConfig): ListParams {
  return {
    sortBy: config.defaultSortBy,
    sortOrder: config.defaultSortOrder,
    page: 1,
    limit: config.limit,
    filters: {},
  };
}

function parsePage(raw: string | null): number {
  if (raw === null) {
    return 1;
  }

  const page = Number.parseInt(raw, 10);

  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

function parseFilters(search: URLSearchParams, config: ListParamsConfig): Record<string, string> {
  const filters: Record<string, string> = {};

  for (const spec of config.filters) {
    const value = search.get(spec.name)?.trim() ?? "";
    const allowed = spec.values === undefined || spec.values.includes(value);

    if (value !== "" && allowed) {
      filters[spec.name] = value;
    }
  }

  return filters;
}

/**
 * @returns The params parsed from the query; absent or invalid values fall back to the defaults.
 */
export function parseListParams(search: URLSearchParams, config: ListParamsConfig): ListParams {
  const sortBy = search.get("sortBy") ?? "";
  const sortOrder = search.get("sortOrder") ?? "";

  return {
    sortBy: config.sortFields.includes(sortBy) ? sortBy : config.defaultSortBy,
    sortOrder: sortOrder === "asc" || sortOrder === "desc" ? sortOrder : config.defaultSortOrder,
    page: parsePage(search.get("page")),
    limit: config.limit,
    filters: parseFilters(search, config),
  };
}

/**
 * @returns Only the values that differ from the defaults, so a clean list has an empty query.
 */
export function serializeListParams(params: ListParams, config: ListParamsConfig): URLSearchParams {
  const search = new URLSearchParams();

  if (params.sortBy !== config.defaultSortBy) {
    search.set("sortBy", params.sortBy);
  }
  if (params.sortOrder !== config.defaultSortOrder) {
    search.set("sortOrder", params.sortOrder);
  }
  if (params.page !== 1) {
    search.set("page", String(params.page));
  }
  for (const spec of config.filters) {
    const value = params.filters[spec.name];
    if (value !== undefined) {
      search.set(spec.name, value);
    }
  }

  return search;
}

/**
 * @param value - `null` removes the filter.
 * @returns The params with the filter applied or removed; the page resets to 1.
 */
export function withFilter(
  params: ListParams,
  name: string,
  value: string | null,
  config: ListParamsConfig,
): ListParams {
  const spec = config.filters.find((candidate) => candidate.name === name);

  const applies =
    spec !== undefined &&
    value !== null &&
    value.trim() !== "" &&
    (spec.values === undefined || spec.values.includes(value));

  if (applies) {
    return { ...params, page: 1, filters: { ...params.filters, [name]: value.trim() } };
  }

  const { [name]: _removed, ...filters } = params.filters;

  return { ...params, page: 1, filters };
}

/**
 * @returns A new field starts ascending; the same field again flips the order.
 */
export function withSort(params: ListParams, sortBy: string): ListParams {
  const sameField = params.sortBy === sortBy;
  const sortOrder = sameField ? (params.sortOrder === "asc" ? "desc" : "asc") : "asc";

  return { ...params, sortBy, sortOrder, page: 1 };
}

export function withPage(params: ListParams, page: number): ListParams {
  return { ...params, page: Math.max(1, page) };
}

export function clearListFilters(params: ListParams): ListParams {
  return {
    ...params,
    page: 1,
    filters: {},
  };
}
