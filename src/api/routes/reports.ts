import { Router } from "express";
import {
	getAccountStatement,
	getAdminSummaryReport,
} from "../controllers/report.controller";
import { auth } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";
import { Role } from "../../models/user";

const router = Router();

// @route   GET api/reports/statements/:accountId
// @desc    Generate a monthly statement for an account
// @access  Private
router.get("/statements/:accountId", auth, getAccountStatement);

// @route   GET api/reports/admin/summary
// @desc    Generate an overall bank summary report
// @access  Private (Admin)
router.get(
	"/admin/summary",
	auth,
	authorize([Role.ADMIN]),
	getAdminSummaryReport,
);

export default router;
