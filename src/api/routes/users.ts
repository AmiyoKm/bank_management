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
import {
	createUserSchema,
	updateUserSchema,
	userParamsSchema,
} from "../validators/users";

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
