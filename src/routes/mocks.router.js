import { Router } from "express";
import { getMokingPets } from "../controllers/mocks.controller.js";

const mocksRouter = Router();

mocksRouter.get("/mockingpets", getMokingPets);

export default mocksRouter;
