import { Router } from "express";
import {
  generateData,
  getMockingUsers,
  getMokingPets,
} from "../controllers/mocks.controller.js";

const mocksRouter = Router();

mocksRouter.get("/mockingpets", getMokingPets);
mocksRouter.get("/mockingusers", getMockingUsers);
mocksRouter.post("/generateData", generateData);

export default mocksRouter;
