import type { Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../lib/auth";
import { createTenantSchema, updateTenantSchema } from "../schemas/tenantSchema";

const tenantInclude = {
  user: { select: { id: true, name: true, email: true } },
  room: {
    include: { property: { select: { id: true, name: true, ownerId: true } } },
  },
} as const;

export async function listTenants(req: AuthRequest, res: Response) {
  const tenants = await prisma.tenant.findMany({
    where: { room: { property: { ownerId: req.userId } } },
    include: tenantInclude,
    orderBy: { createdAt: "desc" },
  });
  return res.json(tenants);
}

export async function createTenant(req: AuthRequest, res: Response) {
  const data = createTenantSchema.parse(req.body);

  if (data.roomId) {
    const room = await prisma.room.findFirst({
      where: { id: data.roomId, property: { ownerId: req.userId } },
      include: { tenants: { where: { moveOutDate: null } } },
    });
    if (!room) {
      return res.status(404).json({ error: "Quarto não encontrado" });
    }
    if (room.tenants.length >= room.capacity) {
      return res.status(409).json({ error: "Quarto sem vagas disponíveis" });
    }
  }

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    return res.status(409).json({ error: "E-mail já cadastrado" });
  }

  const password = await bcrypt.hash(data.password ?? "mudar123", 10);
  const tenant = await prisma.tenant.create({
    data: {
      user: {
        create: {
          name: data.name,
          email: data.email,
          password,
          role: "TENANT",
        },
      },
      ...(data.roomId ? { room: { connect: { id: data.roomId } } } : {}),
      moveInDate: data.moveInDate ?? new Date(),
      emergencyPhone: data.emergencyPhone,
    },
    include: tenantInclude,
  });

  if (data.roomId) {
    const room = await prisma.room.findUnique({
      where: { id: data.roomId },
      include: { tenants: { where: { moveOutDate: null } } },
    });
    if (room && room.tenants.length >= room.capacity) {
      await prisma.room.update({
        where: { id: room.id },
        data: { status: "OCCUPIED" },
      });
    }
  }

  return res.status(201).json(tenant);
}

export async function updateTenant(req: AuthRequest, res: Response) {
  const data = updateTenantSchema.parse(req.body);
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: req.params.id as string,
      room: { property: { ownerId: req.userId } },
    },
    include: tenantInclude,
  });
  if (!tenant) {
    return res.status(404).json({ error: "Morador não encontrado" });
  }

  if (data.roomId) {
    const room = await prisma.room.findFirst({
      where: { id: data.roomId, property: { ownerId: req.userId } },
    });
    if (!room) {
      return res.status(404).json({ error: "Quarto não encontrado" });
    }
  }

  const updated = await prisma.tenant.update({
    where: { id: tenant.id },
    data,
    include: tenantInclude,
  });

  if (data.moveOutDate && tenant.roomId) {
    await prisma.room.update({
      where: { id: tenant.roomId },
      data: { status: "AVAILABLE" },
    });
  }

  return res.json(updated);
}
