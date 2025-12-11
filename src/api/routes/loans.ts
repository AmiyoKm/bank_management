import { Router } from "express";
import {
    applyForLoan,
    getAllLoans,
    getLoanById,
    getLoanSchedule,
    getMyLoans,
    repayLoan,
    updateLoanStatus,
} from "../controllers/loan";
import { auth } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import {
    applyLoanSchema,
    getAllLoansSchema,
    getLoanIdSchema,
    repayLoanSchema,
    updateStatusSchema,
} from "../validators/loan";

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

router.put(
    "/:id/status",
    auth,
    authorize(["ADMIN", "STAFF"]),
    validate(updateStatusSchema),
    updateLoanStatus
);

router.post("/:id/repay", auth, validate(repayLoanSchema), repayLoan);

// @route   GET api/loans/:id/schedule
// @desc    Get the repayment schedule for a loan
// @access  Private
router.get("/:id/schedule", auth, validate(getLoanIdSchema), getLoanSchedule);

export default router;
