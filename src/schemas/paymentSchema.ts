import { z } from "zod";

export const createPaymentSchema = z.object({
  amount: z.number().positive("O valor deve ser maior que zero"),
  dueDate: z.coerce.date(),
  tenantId: z.string().uuid("tenantId inválido"),
});

export const updatePaymentSchema = z.object({
  amount: z.number().positive().optional(),
  dueDate: z.coerce.date().optional(),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]).optional(),
});
