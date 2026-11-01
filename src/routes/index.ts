import { Router } from "express";
import { authMiddleware } from "../lib/auth";
import { authRoutes } from "./authRoutes";
import { propertyRoutes } from "./propertyRoutes";
import { roomRoutes } from "./roomRoutes";
import { tenantRoutes } from "./tenantRoutes";
import { paymentRoutes } from "./paymentRoutes";
import { getDashboard } from "../controllers/dashboardController";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/properties", authMiddleware, propertyRoutes);
routes.use("/rooms", authMiddleware, roomRoutes);
routes.use("/tenants", authMiddleware, tenantRoutes);
routes.use("/payments", authMiddleware, paymentRoutes);
routes.get("/dashboard", authMiddleware, getDashboard);
