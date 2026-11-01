import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "dono@republica.com" },
    update: {},
    create: {
      name: "Dona Marlene",
      email: "dono@republica.com",
      password: await bcrypt.hash("republica123", 10),
      role: "ADMIN",
    },
  });

  const property = await prisma.property.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "República Central",
      address: "Rua das Flores, 123 - Centro",
      ownerId: owner.id,
    },
  });

  const roomsData = [
    { number: "Quarto 1", capacity: 1, price: 850 },
    { number: "Quarto 2", capacity: 2, price: 650 },
    { number: "Quarto 3", capacity: 1, price: 900 },
    { number: "Quarto 4", capacity: 2, price: 600 },
  ];
  const rooms = [];
  for (const r of roomsData) {
    rooms.push(
      await prisma.room.create({
        data: { ...r, propertyId: property.id },
      }),
    );
  }

  const tenantsData = [
    { name: "João Silva", email: "joao@mail.com", roomIndex: 0 },
    { name: "Maria Souza", email: "maria@mail.com", roomIndex: 1 },
    { name: "Pedro Lima", email: "pedro@mail.com", roomIndex: 2 },
  ];

  for (const [i, t] of tenantsData.entries()) {
    const existingUser = await prisma.user.findUnique({
      where: { email: t.email },
    });
    if (existingUser) continue;

    const room = rooms[t.roomIndex]!;
    const tenant = await prisma.tenant.create({
      data: {
        user: {
          create: {
            name: t.name,
            email: t.email,
            password: await bcrypt.hash("morador123", 10),
            role: "TENANT",
          },
        },
        room: { connect: { id: room.id } },
        moveInDate: new Date(2026, 8, 1),
        emergencyPhone: "1199999000" + i,
      },
    });

    const activeTenants = await prisma.tenant.count({
      where: { roomId: room.id, moveOutDate: null },
    });
    await prisma.room.update({
      where: { id: room.id },
      data: {
        status: activeTenants >= room.capacity ? "OCCUPIED" : "AVAILABLE",
      },
    });

    const now = new Date();
    await prisma.payment.createMany({
      data: [
        {
          tenantId: tenant.id,
          amount: room.price,
          dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 10),
          paidDate: new Date(now.getFullYear(), now.getMonth() - 1, 9),
          status: "PAID",
        },
        {
          tenantId: tenant.id,
          amount: room.price,
          dueDate: new Date(now.getFullYear(), now.getMonth(), 10),
          status: i === 2 ? "OVERDUE" : "PENDING",
        },
      ],
    });
  }

  console.log("Seed concluído: dono@republica.com / republica123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
