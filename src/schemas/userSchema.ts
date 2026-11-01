import { z } from "zod";

// Este esquema garante que os dados enviados pelo usuário tenham o formato correto
export const createUserSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.email("Formato de e-mail inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  role: z.enum(["ADMIN", "TENANT"]).optional(),
});

export const loginSchema = z.object({
  email: z.email("Formato de e-mail inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});
