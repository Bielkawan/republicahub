import { Router } from "express";
import {
  createRoom,
  deleteRoom,
  listRooms,
  updateRoom,
} from "../controllers/roomController";

export const roomRoutes = Router();

roomRoutes.get("/", listRooms);
roomRoutes.post("/", createRoom);
roomRoutes.patch("/:id", updateRoom);
roomRoutes.delete("/:id", deleteRoom);
