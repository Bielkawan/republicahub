import { Router } from "express";
import {
  createTenant,
  listTenants,
  updateTenant,
} from "../controllers/tenantController";

export const tenantRoutes = Router();

tenantRoutes.get("/", listTenants);
tenantRoutes.post("/", createTenant);
tenantRoutes.patch("/:id", updateTenant);
