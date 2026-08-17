import { z } from "zod";

export const SystemConfigUpdateSchema = z.object({
  phase: z.string().max(50).optional(),
  maxReg: z.union([z.string(), z.number()]).transform(String).optional(),
  allowReg: z.boolean().optional(),
  maintenance: z.boolean().optional(),
  festStartDate: z.string().max(30).optional(),
  paymentLink: z.string().url("Payment link must be a valid URL").or(z.literal("")).optional(),
});

export type SystemConfigUpdateInput = z.infer<typeof SystemConfigUpdateSchema>;
