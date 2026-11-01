import { z } from "zod";

export const createRoomSchema = z.object({
  number: z.string().min(1, "O número/nome do quarto é obrigatório"),
  capacity: z.number().int().positive().default(1),
  price: z.number().positive("O preço deve ser maior que zero"),
  propertyId: z.string().uuid("propertyId inválido"),
});

export const updateRoomSchema = z.object({
  number: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  status: z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE"]).optional(),
});
