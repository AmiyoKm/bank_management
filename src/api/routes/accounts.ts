import { Router } from "express";
import {
	createAccount,
	getAccounts,
	getMyAccounts,
	getAccountById,
	updateAccount,
	deleteAccount,
} from "../controllers/accounts";
import { auth } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import {
	createAccountSchema,
	updateAccountSchema,
	accountIdSchema,
    getAccountsSchema,
} from "../validators/accounts";
import { Role } from "../../models/user";

const router = Router();

router.post("/", auth, validate(createAccountSchema), createAccount);

router.get("/", auth, authorize([Role.ADMIN, Role.STAFF]), validate(getAccountsSchema), getAccounts);

router.get("/me", auth, getMyAccounts);

router.get("/:id", auth, validate(accountIdSchema), getAccountById);

router.patch(
	"/:id",
	auth,
	authorize([Role.ADMIN, Role.STAFF]),
	validate(updateAccountSchema),
	updateAccount,
);

router.delete(
	"/:id",
	auth,
	authorize([Role.ADMIN]),
	validate(accountIdSchema),
	deleteAccount,
);

export default router;
