import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.js";
import { auth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { registerUserSchema, loginUserSchema } from "../validators/auth.js";

const router = Router();

router.post("/register", validate(registerUserSchema), register);

router.post("/login", validate(loginUserSchema), login);

router.get("/me", auth, getMe);

export default router;
