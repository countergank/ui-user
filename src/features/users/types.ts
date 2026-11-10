import { z } from "zod";

export const USER_ROLES = ["admin", "user", "viewer"] as const;
export type UserRoleName = (typeof USER_ROLES)[number];

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  lastName: z.string(),
  email: z.string(),
  userName: z.string(),
  role: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isActive: z.boolean(),
  lockedUntil: z.string().nullable(),
  failedLoginAttempts: z.number(),
  emailVerified: z.boolean(),
  hasPendingEmailChange: z.boolean(),
  hasPendingPasswordReset: z.boolean(),
});

export const paginatedUsersSchema = z.object({
  data: z.array(userSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const createUserResponseSchema = z.object({
  name: z.string(),
  lastName: z.string(),
  email: z.string(),
  userName: z.string(),
  role: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isActive: z.boolean(),
});

export const unlockUserResponseSchema = z.object({
  message: z.string(),
  userId: z.string(),
});

export type UserDTO = z.infer<typeof userSchema>;
export type PaginatedUsers = z.infer<typeof paginatedUsersSchema>;
export type CreateUserResponseDTO = z.infer<typeof createUserResponseSchema>;
export type UnlockUserResponseDTO = z.infer<typeof unlockUserResponseSchema>;
