import { Router } from "express";
import { Role } from "../../models/user.js";
import {
    getAccountStatement,
    getAdminSummaryReport,
} from "../controllers/report.js";
import { auth } from "../middlewares/auth.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { adminSummarySchema, statementSchema } from "../validators/report.js";

const router = Router();

router.get(
    "/statements/:accountId",
    auth,
    validate(statementSchema),
    getAccountStatement
);

router.get(
    "/admin/summary",
    auth,
    authorize([Role.ADMIN]),
    validate(adminSummarySchema),
    getAdminSummaryReport
);

export default router;
