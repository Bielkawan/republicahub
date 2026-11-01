import "dotenv/config";
import express from "express";
import cors from "cors";
import { ZodError } from "zod";
import { routes } from "./routes";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", routes);

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.issues });
    }
    console.error(err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  },
);

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
