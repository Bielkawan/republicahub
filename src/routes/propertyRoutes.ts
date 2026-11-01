import { Router } from "express";
import {
  createProperty,
  deleteProperty,
  getProperty,
  listProperties,
} from "../controllers/propertyController";

export const propertyRoutes = Router();

propertyRoutes.get("/", listProperties);
propertyRoutes.post("/", createProperty);
propertyRoutes.get("/:id", getProperty);
propertyRoutes.delete("/:id", deleteProperty);
