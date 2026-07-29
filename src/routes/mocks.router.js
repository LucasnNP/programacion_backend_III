import { Router } from "express";
import {
  generateData,
  getMockingUsers,
  getMockingPets,
} from "../controllers/mocks.controller.js";

const mocksRouter = Router();

mocksRouter.get("/mockingpets", getMockingPets);
mocksRouter.get("/mockingusers", getMockingUsers);
mocksRouter.post("/generateData", generateData);

export default mocksRouter;
