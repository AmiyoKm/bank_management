import { Router } from "express";
import {
    deposit,
    externalTransfer,
    getTransactionById,
    getTransactions,
    transfer,
    withdraw,
} from "../controllers/transactions";
import { auth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
    depositSchema,
    externalTransferSchema,
    getTransactionsSchema,
    transactionIdSchema,
    transferSchema,
    withdrawSchema,
} from "../validators/transactions";

const router = Router();

router.post("/deposit", auth, validate(depositSchema), deposit);

router.post("/withdraw", auth, validate(withdrawSchema), withdraw);

router.post("/transfer", auth, validate(transferSchema), transfer);

router.post(
    "/transfer/external",
    auth,
    validate(externalTransferSchema),
    externalTransfer
);

router.get("/", auth, validate(getTransactionsSchema), getTransactions);

router.get("/:id", auth, validate(transactionIdSchema), getTransactionById);

export default router;
