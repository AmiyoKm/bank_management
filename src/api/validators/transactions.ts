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
        accountId: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : undefined)),
        page: z
            .string()
            .min(1)
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : undefined)),
        limit: z
            .string()
            .min(1)
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : undefined)),
        sort: z.enum(["asc", "desc"]).optional(),
        type: z.nativeEnum(TransactionType).optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
    }),
});

export const transactionIdSchema = z.object({
    params: z.object({
        id: z
            .string()
            .refine((val) => !isNaN(parseInt(val, 10)), {
                message: "Id must be a number",
            })
            .transform((val) => parseInt(val, 10)),
    }),
});
