import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken, type AuthRequest } from "../lib/auth";
import { createUserSchema, loginSchema } from "../schemas/userSchema";

export async function register(req: Request, res: Response) {
  const userData = createUserSchema.parse(req.body);

  const exists = await prisma.user.findUnique({
    where: { email: userData.email },
  });
  if (exists) {
    return res.status(409).json({ error: "E-mail já cadastrado" });
  }

  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: await bcrypt.hash(userData.password, 10),
      role: userData.role ?? "TENANT",
    },
  });

  const { password: _password, ...safeUser } = user;
  return res
    .status(201)
    .json({ message: "Usuário criado com sucesso!", user: safeUser });
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "E-mail ou senha inválidos" });
  }

  const { password: _password, ...safeUser } = user;
  return res.json({ token: signToken(user.id), user: safeUser });
}

export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  const { password: _password, ...safeUser } = user;
  return res.json(safeUser);
}
