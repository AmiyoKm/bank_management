import { Router } from "express";
import {
	applyForLoan,
	getAllLoans,
	getMyLoans,
	getLoanById,
	updateLoanStatus,
	repayLoan,
	getLoanSchedule,
} from "../controllers/loan.controller";
import { auth } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";

const router = Router();

// @route   POST api/loans/apply
// @desc    Customer applies for a loan
// @access  Private (Customer)
router.post("/apply", auth, applyForLoan);

// @route   GET api/loans
// @desc    Get all loan applications (for staff/admin)
// @access  Private (Admin, Staff)
router.get("/", auth, authorize(["ADMIN", "STAFF"]), getAllLoans);

// @route   GET api/loans/me
// @desc    Get all loans for the logged-in customer
// @access  Private (Customer)
router.get("/me", auth, getMyLoans);

// @route   GET api/loans/:id
// @desc    Get details of a specific loan
// @access  Private
router.get("/:id", auth, getLoanById);

// @route   PUT api/loans/:id/status
// @desc    Update loan status (approve/reject)
// @access  Private (Admin, Staff)
router.put(
	"/:id/status",
	auth,
	authorize(["ADMIN", "STAFF"]),
	updateLoanStatus,
);

// @route   POST api/loans/:id/repay
// @desc    Make a payment towards a loan
// @access  Private (Customer)
router.post("/:id/repay", auth, repayLoan);

// @route   GET api/loans/:id/schedule
// @desc    Get the repayment schedule for a loan
// @access  Private
router.get("/:id/schedule", auth, getLoanSchedule);

export default router;
