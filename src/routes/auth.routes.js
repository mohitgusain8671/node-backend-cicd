import { signup, signin, signout } from "#controllers/auth.controller.js";
import { Router } from "express";

const authRoutes = Router();

authRoutes.post("/sign-up", signup);
authRoutes.post("/sign-in", signin);
authRoutes.post("/sign-out", signout);

export default authRoutes;
