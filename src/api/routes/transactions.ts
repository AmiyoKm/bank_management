import { Router } from "express";
import {
    deposit,
    externalTransfer,
    getTransactionById,
    getTransactions,
    transfer,
    withdraw,
} from "../controllers/transactions.js";
import { auth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
    depositSchema,
    externalTransferSchema,
    getTransactionsSchema,
    transactionIdSchema,
    transferSchema,
    withdrawSchema,
} from "../validators/transactions.js";

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
