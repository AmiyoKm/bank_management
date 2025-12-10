import { Router } from "express";
import {
	createAccount,
	getAccounts,
	getMyAccounts,
	getAccountById,
	updateAccount,
	deleteAccount,
} from "../controllers/account.controller";
import { auth } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";

const router = Router();

// @route   POST api/accounts
// @desc    Create a new account
// @access  Private
router.post("/", auth, createAccount);

// @route   GET api/accounts
// @desc    Get all accounts (for staff/admin)
// @access  Private (Admin, Staff)
router.get("/", auth, authorize(["ADMIN", "STAFF"]), getAccounts);

// @route   GET api/accounts/me
// @desc    Get all accounts for the logged-in customer
// @access  Private
router.get("/me", auth, getMyAccounts);

// @route   GET api/accounts/:id
// @desc    Get account details
// @access  Private
router.get("/:id", auth, getAccountById);

// @route   PUT api/accounts/:id
// @desc    Update account details (for staff/admin)
// @access  Private (Admin, Staff)
router.put("/:id", auth, authorize(["ADMIN", "STAFF"]), updateAccount);

// @route   DELETE api/accounts/:id
// @desc    Delete an account (for admin)
// @access  Private (Admin)
router.delete("/:id", auth, authorize(["ADMIN"]), deleteAccount);

export default router;
