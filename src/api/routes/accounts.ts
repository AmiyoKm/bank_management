import { Router } from "express";
import {
	createAccount,
	getAccounts,
	getMyAccounts,
	getAccountById,
	updateAccount,
	deleteAccount,
} from "../controllers/accounts.js";
import { auth } from "../middlewares/auth.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import {
	createAccountSchema,
	updateAccountSchema,
	accountIdSchema,
    getAccountsSchema,
} from "../validators/accounts.js";
import { Role } from "../../models/user.js";

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
