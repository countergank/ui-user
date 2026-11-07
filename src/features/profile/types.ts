import { z } from "zod";

export const profileSchema = z.object({
  name: z.string(),
  lastName: z.string(),
  email: z.string(),
});

export type ProfileDTO = z.infer<typeof profileSchema>;
