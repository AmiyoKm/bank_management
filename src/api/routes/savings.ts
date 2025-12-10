import { Router } from "express";
import {
    createFixedDeposit,
    getAllFixedDeposits,
    getMyFixedDeposits,
    getFixedDepositById,
} from "../controllers/fixedDeposit.controller";
import { auth } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";

const router = Router();

// @route   POST api/savings/fd
// @desc    Create a new fixed deposit
// @access  Private (Customer)
router.post("/fd", auth, createFixedDeposit);

// @route   GET api/savings/fd
// @desc    Get all fixed deposits (for staff/admin)
// @access  Private (Admin, Staff)
router.get("/fd", auth, authorize(["ADMIN", "STAFF"]), getAllFixedDeposits);

// @route   GET api/savings/fd/me
// @desc    Get all fixed deposits for the logged-in customer
// @access  Private (Customer)
router.get("/fd/me", auth, getMyFixedDeposits);

// @route   GET api/savings/fd/:id
// @desc    Get details of a specific fixed deposit
// @access  Private
router.get("/fd/:id", auth, getFixedDepositById);

export default router;
