import type { Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../lib/auth";
import { createRoomSchema, updateRoomSchema } from "../schemas/roomSchema";

export async function listRooms(req: AuthRequest, res: Response) {
  const propertyId =
    typeof req.query.propertyId === "string" ? req.query.propertyId : undefined;
  const rooms = await prisma.room.findMany({
    where: { property: { ownerId: req.userId }, ...(propertyId && { propertyId }) },
    include: {
      property: { select: { id: true, name: true } },
      tenants: {
        where: { moveOutDate: null },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { number: "asc" },
  });
  return res.json(rooms);
}

export async function createRoom(req: AuthRequest, res: Response) {
  const data = createRoomSchema.parse(req.body);
  const property = await prisma.property.findFirst({
    where: { id: data.propertyId, ownerId: req.userId },
  });
  if (!property) {
    return res.status(404).json({ error: "Propriedade não encontrada" });
  }
  const room = await prisma.room.create({ data });
  return res.status(201).json(room);
}

export async function updateRoom(req: AuthRequest, res: Response) {
  const data = updateRoomSchema.parse(req.body);
  const room = await prisma.room.findFirst({
    where: { id: req.params.id as string, property: { ownerId: req.userId } },
  });
  if (!room) {
    return res.status(404).json({ error: "Quarto não encontrado" });
  }
  const updated = await prisma.room.update({
    where: { id: room.id },
    data,
  });
  return res.json(updated);
}

export async function deleteRoom(req: AuthRequest, res: Response) {
  const room = await prisma.room.findFirst({
    where: { id: req.params.id as string, property: { ownerId: req.userId } },
    include: { tenants: { where: { moveOutDate: null } } },
  });
  if (!room) {
    return res.status(404).json({ error: "Quarto não encontrado" });
  }
  if (room.tenants.length > 0) {
    return res
      .status(409)
      .json({ error: "Não é possível remover um quarto com moradores ativos" });
  }
  await prisma.room.delete({ where: { id: room.id } });
  return res.status(204).send();
}
