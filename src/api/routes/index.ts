import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import accountRoutes from "./accounts";
import transactionRoutes from "./transactions";
// import loanRoutes from "./loans";
// import savingsRoutes from "./savings";
// import reportRoutes from "./reports";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/accounts", accountRoutes);
router.use("/transactions", transactionRoutes);
// router.use("/loans", loanRoutes);
// router.use("/savings", savingsRoutes);
// router.use("/reports", reportRoutes);

export default router;
