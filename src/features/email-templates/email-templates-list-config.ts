import type { ListParamsConfig } from "@/components/data-list/params";

/**
 * The api-user template list sorts by `createdAt` desc server-side and only filters by `active`,
 * so `sortFields` pins the single supported order and `filters` carries the tri-state flag.
 */
export const EMAIL_TEMPLATES_LIST_PARAMS: ListParamsConfig = {
  limit: 20,
  sortFields: ["createdAt"],
  defaultSortBy: "createdAt",
  defaultSortOrder: "desc",
  filters: [{ name: "active", values: ["true", "false"] }],
};
