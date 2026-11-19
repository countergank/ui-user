import { z } from "zod";

export const activeSessionSchema = z.object({
  id: z.string().min(1),
  device: z.string().nullable(),
  ip: z.string().nullable(),
  issuedAt: z.string(),
  lastAccessAt: z.string(),
  expiresAt: z.string(),
});

export type ActiveSessionDTO = z.infer<typeof activeSessionSchema>;
