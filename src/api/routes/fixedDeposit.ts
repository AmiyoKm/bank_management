import { Router } from "express";
import {
    createFixedDeposit,
    getAllFixedDeposits,
    getFixedDepositById,
    getMyFixedDeposits,
    processMaturity,
} from "../controllers/fixedDeposit";
import { auth } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import {
    createFixedDepositSchema,
    fixedDepositIdSchema,
    getFixedDepositsSchema,
} from "../validators/fixedDeposit";

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
