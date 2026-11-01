import { z } from "zod";

export const createPropertySchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  address: z.string().min(5, "O endereço deve ter pelo menos 5 caracteres"),
});
