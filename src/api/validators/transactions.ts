import { z } from "zod";
import { TransactionType } from "../../../generated/prisma/client.js";

export const depositSchema = z.object({
    body: z.object({
        accountId: z.number().int().positive(),
        amount: z.number().positive(),
        description: z.string().optional(),
    }),
});

export const withdrawSchema = z.object({
    body: z.object({
        accountId: z.number().int().positive(),
        amount: z.number().positive(),
        description: z.string().optional(),
    }),
});

export const transferSchema = z.object({
    body: z.object({
        fromAccountId: z.number().int().positive(),
        toAccountId: z.number().int().positive(),
        amount: z.number().positive(),
        description: z.string().optional(),
    }),
});

export const externalTransferSchema = z.object({
    body: z.object({
        fromAccountId: z.number().int().positive(),
        amount: z.number().positive(),
        toExternalAccountNumber: z.string().min(1),
        toExternalRoutingNumber: z.string().min(1),
        description: z.string().optional(),
    }),
});

export const getTransactionsSchema = z.object({
    query: z.object({
        accountId: z.string().optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
        sort: z.enum(["asc", "desc"]).optional(),
        type: z.nativeEnum(TransactionType).optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
    }),
});

export const transactionIdSchema = z.object({
    params: z.object({
        id: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
            message: "Id must be a number",
        }),
    }),
});

export type DepositBody = z.infer<typeof depositSchema>["body"];
export type WithdrawBody = z.infer<typeof withdrawSchema>["body"];
export type TransferBody = z.infer<typeof transferSchema>["body"];
export type ExternalTransferBody = z.infer<typeof externalTransferSchema>["body"];
export type GetTransactionsQuery = z.infer<typeof getTransactionsSchema>["query"];
export type TransactionIdParams = z.infer<typeof transactionIdSchema>["params"];
