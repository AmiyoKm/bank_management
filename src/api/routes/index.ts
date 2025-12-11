import { Router } from "express";
import accountRoutes from "./accounts.js";
import authRoutes from "./auth.js";
import fixedDepositRoutes from "./fixedDeposit.js";
import loanRoutes from "./loans.js";
import reportRoutes from "./reports.js";
import transactionRoutes from "./transactions.js";
import userRoutes from "./users.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/accounts", accountRoutes);
router.use("/transactions", transactionRoutes);
router.use("/loans", loanRoutes);
router.use("/fixed-deposit", fixedDepositRoutes);
router.use("/reports", reportRoutes);

export default router;
