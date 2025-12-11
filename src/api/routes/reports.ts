import { Router } from "express";
import { Role } from "../../models/user";
import {
    getAccountStatement,
    getAdminSummaryReport,
} from "../controllers/report";
import { auth } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { adminSummarySchema, statementSchema } from "../validators/report";

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
