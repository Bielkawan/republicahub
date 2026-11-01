import type { Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../lib/auth";

export async function getDashboard(req: AuthRequest, res: Response) {
  const ownerFilter = { property: { ownerId: req.userId } };

  const [properties, rooms, tenants, payments] = await Promise.all([
    prisma.property.count({ where: { ownerId: req.userId } }),
    prisma.room.groupBy({
      by: ["status"],
      where: ownerFilter,
      _count: { _all: true },
    }),
    prisma.tenant.count({
      where: { room: ownerFilter, moveOutDate: null },
    }),
    prisma.payment.findMany({
      where: { tenant: { room: ownerFilter } },
      include: {
        tenant: { include: { user: { select: { name: true } } } },
      },
      orderBy: { dueDate: "desc" },
    }),
  ]);

  const roomStatus = { AVAILABLE: 0, OCCUPIED: 0, MAINTENANCE: 0 };
  for (const r of rooms)
    roomStatus[r.status as keyof typeof roomStatus] = r._count._all;

  const totals = { pending: 0, paid: 0, overdue: 0 };
  for (const p of payments) {
    const amount = Number(p.amount);
    if (p.status === "PAID") totals.paid += amount;
    else if (p.status === "OVERDUE") totals.overdue += amount;
    else totals.pending += amount;
  }

  return res.json({
    properties,
    rooms: roomStatus,
    activeTenants: tenants,
    payments: totals,
    recentPayments: payments.slice(0, 8),
  });
}
