import type { Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../lib/auth";
import { createPropertySchema } from "../schemas/propertySchema";

export async function listProperties(req: AuthRequest, res: Response) {
  const properties = await prisma.property.findMany({
    where: { ownerId: req.userId },
    include: {
      _count: { select: { rooms: true } },
      rooms: {
        include: { _count: { select: { tenants: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json(properties);
}

export async function getProperty(req: AuthRequest, res: Response) {
  const property = await prisma.property.findFirst({
    where: { id: req.params.id as string, ownerId: req.userId },
    include: { rooms: { include: { tenants: true } } },
  });
  if (!property) {
    return res.status(404).json({ error: "Propriedade não encontrada" });
  }
  return res.json(property);
}

export async function createProperty(req: AuthRequest, res: Response) {
  const data = createPropertySchema.parse(req.body);
  const property = await prisma.property.create({
    data: { ...data, ownerId: req.userId! },
  });
  return res.status(201).json(property);
}

export async function deleteProperty(req: AuthRequest, res: Response) {
  const property = await prisma.property.findFirst({
    where: { id: req.params.id as string, ownerId: req.userId },
  });
  if (!property) {
    return res.status(404).json({ error: "Propriedade não encontrada" });
  }
  await prisma.property.delete({ where: { id: property.id } });
  return res.status(204).send();
}
