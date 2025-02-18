import { z } from "zod";

export const formSchema = z.object({
  orgName: z.string().min(2).max(50),
  orgSlug: z.string().min(2).max(50),
});
