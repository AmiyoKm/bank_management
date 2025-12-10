import { Router } from "express";
import {
    deposit,
    withdraw,
    internalTransfer,
    externalTransfer,
    getAccountTransactionHistory
} from "../controllers/transaction.controller";
import { auth } from "../middlewares/auth";

const router = Router();

// @route   POST api/transactions/deposit
// @desc    Deposit funds into an account
// @access  Private
router.post("/deposit", auth, deposit);

// @route   POST api/transactions/withdraw
// @desc    Withdraw funds from an account
// @access  Private
router.post("/withdraw", auth, withdraw);

// @route   POST api/transactions/transfer/internal
// @desc    Transfer funds between internal accounts
// @access  Private
router.post("/transfer/internal", auth, internalTransfer);

// @route   POST api/transactions/transfer/external
// @desc    Transfer funds to an external account
// @access  Private
router.post("/transfer/external", auth, externalTransfer);

// @route   GET api/transactions/history/:accountId
// @desc    Get transaction history for a specific account
// @access  Private
router.get("/history/:accountId", auth, getAccountTransactionHistory);

export default router;
