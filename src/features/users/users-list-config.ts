import type { ListParamsConfig } from "@/components/data-list/params";

export const USERS_LIST_PARAMS: ListParamsConfig = {
  limit: 20,
  sortFields: [
    "name",
    "lastName",
    "email",
    "userName",
    "role",
    "isActive",
    "createdAt",
    "updatedAt",
  ],
  defaultSortBy: "createdAt",
  defaultSortOrder: "desc",
  filters: [{ name: "search" }, { name: "role" }, { name: "isActive", values: ["true", "false"] }],
};

export const USER_ROLES = ["admin", "user", "viewer"] as const;
