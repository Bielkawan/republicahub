import { z } from "zod";

export const createTenantSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.email("Formato de e-mail inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres").optional(),
  roomId: z.string().uuid().optional(),
  moveInDate: z.coerce.date().optional(),
  emergencyPhone: z.string().optional(),
});

export const updateTenantSchema = z.object({
  roomId: z.string().uuid().nullable().optional(),
  moveOutDate: z.coerce.date().nullable().optional(),
  emergencyPhone: z.string().optional(),
});
