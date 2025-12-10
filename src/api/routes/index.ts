import { Router } from "express";
import accountRoutes from "./accounts";
import authRoutes from "./auth";
import transactionRoutes from "./transactions";
import userRoutes from "./users";
// import loanRoutes from "./loans";
import fixedDepositRoutes from "./fixedDeposit";
// import reportRoutes from "./reports";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/accounts", accountRoutes);
router.use("/transactions", transactionRoutes);
// router.use("/loans", loanRoutes);
router.use("/fixed-deposit", fixedDepositRoutes);
// router.use("/reports", reportRoutes);

export default router;
