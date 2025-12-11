import { Router } from "express";
import {
    createFixedDeposit,
    getAllFixedDeposits,
    getFixedDepositById,
    getMyFixedDeposits,
    processMaturity,
} from "../controllers/fixedDeposit.js";
import { auth } from "../middlewares/auth.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import {
    createFixedDepositSchema,
    fixedDepositIdSchema,
    getFixedDepositsSchema,
} from "../validators/fixedDeposit.js";

const router = Router();

router.post("/", auth, validate(createFixedDepositSchema), createFixedDeposit);

router.get(
    "/",
    auth,
    authorize(["ADMIN", "STAFF"]),
    validate(getFixedDepositsSchema),
    getAllFixedDeposits
);

router.get("/me", auth, validate(getFixedDepositsSchema), getMyFixedDeposits);

router.get("/:id", auth, validate(fixedDepositIdSchema), getFixedDepositById);

router.post(
    "/process-maturity",
    auth,
    authorize(["ADMIN", "STAFF"]),
    processMaturity
);

export default router;
