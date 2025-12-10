import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.js";
import { auth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { registerUserSchema, loginUserSchema } from "../validators/auth.js";

const router = Router();

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", validate(registerUserSchema), register);

// @route   POST api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post("/login", validate(loginUserSchema), login);

// @route   GET api/auth/me
// @desc    Get current user's profile
// @access  Private
router.get("/me", auth, getMe);

export default router;
