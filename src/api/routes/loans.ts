import { Router } from "express";
import {
    applyForLoan,
    getAllLoans,
    getLoanById,
    getLoanPayments,
    getLoanSchedule,
    getMyLoans,
    repayLoan,
    updateLoanStatus,
} from "../controllers/loan.js";
import { auth } from "../middlewares/auth.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import {
    applyLoanSchema,
    getAllLoansSchema,
    getLoanIdSchema,
    repayLoanSchema,
    updateStatusSchema,
} from "../validators/loan.js";

const router = Router();

router.post("/apply", auth, validate(applyLoanSchema), applyForLoan);
router.get(
    "/",
    auth,
    authorize(["ADMIN", "STAFF"]),
    validate(getAllLoansSchema),
    getAllLoans
);
router.get("/me", auth, validate(getAllLoansSchema), getMyLoans);

router.get("/:id", auth, validate(getLoanIdSchema), getLoanById);

router.patch(
    "/:id/status",
    auth,
    authorize(["ADMIN", "STAFF"]),
    validate(updateStatusSchema),
    updateLoanStatus
);

router.post("/:id/repay", auth, validate(repayLoanSchema), repayLoan);

router.get("/:id/schedule", auth, validate(getLoanIdSchema), getLoanSchedule);
router.get("/:id/payments", auth, validate(getLoanIdSchema), getLoanPayments);

export default router;
