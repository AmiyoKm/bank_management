import { Router } from "express";
import {
	getAllUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
} from "../controllers/user.js";
import { auth } from "../middlewares/auth.js";
import { authorize } from "../middlewares/authorize.js";
import { Role } from "../../models/user.js";
import { validate } from "../middlewares/validate.js";
import {
	createUserSchema,
	updateUserSchema,
	userParamsSchema,
} from "../validators/users.js";

const router = Router();

router.get("/", auth, authorize([Role.ADMIN]), getAllUsers);

router.get(
	"/:id",
	auth,
	authorize([Role.ADMIN]),
	validate(userParamsSchema),
	getUserById,
);

router.post(
	"/",
	auth,
	authorize([Role.ADMIN]),
	validate(createUserSchema),
	createUser,
);
router.patch(
	"/:id",
	auth,
	authorize([Role.ADMIN]),
	validate(userParamsSchema),
	validate(updateUserSchema),
	updateUser,
);

router.delete(
	"/:id",
	auth,
	authorize([Role.ADMIN]),
	validate(userParamsSchema),
	deleteUser,
);

export default router;
