import { Router } from "express";
import {
	getAllUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
} from "../controllers/user";
import { auth } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";
import { Role } from "../../models/user";
import { validate } from "../middlewares/validate";
import { createUserSchema, updateUserSchema, userParamsSchema } from "../validators/users";

const router = Router();

// @route   GET api/users
// @desc    Get all users
// @access  Private (Admin)
router.get("/", auth, authorize([Role.ADMIN]), getAllUsers);

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private (Admin)
router.get("/:id", auth, authorize([Role.ADMIN]), validate(userParamsSchema), getUserById);

// @route   POST api/users
// @desc    Create a new user
// @access  Private (Admin)
router.post(
	"/",
	auth,
	authorize([Role.ADMIN]),
	validate(createUserSchema),
	createUser,
);

// @route   PUT api/users/:id
// @desc    Update user details
// @access  Private (Admin)
router.put("/:id", auth, authorize([Role.ADMIN]), validate(userParamsSchema), validate(updateUserSchema), updateUser);

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Private (Admin)
router.delete("/:id", auth, authorize([Role.ADMIN]), validate(userParamsSchema), deleteUser);

export default router;
