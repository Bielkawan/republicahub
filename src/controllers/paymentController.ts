import type { Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../lib/auth";
import {
  createPaymentSchema,
  updatePaymentSchema,
} from "../schemas/paymentSchema";

const paymentInclude = {
  tenant: {
    include: {
      user: { select: { id: true, name: true, email: true } },
      room: { include: { property: { select: { id: true, name: true } } } },
    },
  },
} as const;

export async function listPayments(req: AuthRequest, res: Response) {
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;
  const payments = await prisma.payment.findMany({
    where: {
      tenant: { room: { property: { ownerId: req.userId } } },
      ...(status === "PENDING" || status === "PAID" || status === "OVERDUE"
        ? { status }
        : {}),
    },
    include: paymentInclude,
    orderBy: { dueDate: "desc" },
  });
  return res.json(payments);
}

export async function createPayment(req: AuthRequest, res: Response) {
  const data = createPaymentSchema.parse(req.body);
  const tenant = await prisma.tenant.findFirst({
    where: { id: data.tenantId, room: { property: { ownerId: req.userId } } },
  });
  if (!tenant) {
    return res.status(404).json({ error: "Morador não encontrado" });
  }
  const payment = await prisma.payment.create({
    data,
    include: paymentInclude,
  });
  return res.status(201).json(payment);
}

export async function updatePayment(req: AuthRequest, res: Response) {
  const data = updatePaymentSchema.parse(req.body);
  const payment = await prisma.payment.findFirst({
    where: {
      id: req.params.id as string,
      tenant: { room: { property: { ownerId: req.userId } } },
    },
  });
  if (!payment) {
    return res.status(404).json({ error: "Pagamento não encontrado" });
  }
  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      ...data,
      paidDate: data.status === "PAID" ? new Date() : undefined,
    },
    include: paymentInclude,
  });
  return res.json(updated);
}

export async function markAsPaid(req: AuthRequest, res: Response) {
  const payment = await prisma.payment.findFirst({
    where: {
      id: req.params.id as string,
      tenant: { room: { property: { ownerId: req.userId } } },
    },
  });
  if (!payment) {
    return res.status(404).json({ error: "Pagamento não encontrado" });
  }
  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "PAID", paidDate: new Date() },
    include: paymentInclude,
  });
  return res.json(updated);
}
