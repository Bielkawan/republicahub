import "dotenv/config";
import express from "express";
import { createUserSchema } from "./schemas/userSchema";
import { prisma } from "./lib/prisma"; // Certifique-se de ter criado o arquivo src/lib/prisma.ts antes

const app = express();
app.use(express.json());

app.post("/users", async (req, res) => {
  try {
    const userData = createUserSchema.parse(req.body);
    
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: userData.password,
      },
    });

    return res.status(201).json({ message: "Usuário criado com sucesso!", user });
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || error.message });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));