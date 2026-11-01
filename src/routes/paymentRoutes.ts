import { Router } from "express";
import {
  createPayment,
  listPayments,
  markAsPaid,
  updatePayment,
} from "../controllers/paymentController";

export const paymentRoutes = Router();

paymentRoutes.get("/", listPayments);
paymentRoutes.post("/", createPayment);
paymentRoutes.patch("/:id", updatePayment);
paymentRoutes.post("/:id/pay", markAsPaid);
