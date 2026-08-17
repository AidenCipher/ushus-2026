import { z } from "zod";

export const SupportMessageSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  message: z.string().min(10, "Please describe your issue in a bit more detail").max(5000),
});

export type SupportMessageInput = z.infer<typeof SupportMessageSchema>;
