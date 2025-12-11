import { z } from "zod";
import { LoanStatus } from "../../../generated/prisma/client";

export const applyLoanSchema = z.object({
    body: z.object({
        amount: z.number().positive(),
        term: z.number().int().positive(),
        disbursementAccountId: z.number().int().positive(),
    }),
});

export const updateStatusSchema = z.object({
    body: z.object({
        status: z.nativeEnum(LoanStatus),
        disbursementAccountId: z.number().int().positive(),
    }),
    params: z.object({
        id: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
            message: "Id must be a number",
        }),
    }),
});

export const getAllLoansSchema = z.object({
    query: z.object({
        status: z.nativeEnum(LoanStatus).optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
        userId: z.string().optional(),
    }),
});

export const repayLoanSchema = z.object({
    body: z.object({
        amount: z.number().positive(),
        fromAccountId: z.number().int().positive(),
        scheduleId: z.number().int().positive(),
    }),
    params: z.object({
        id: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
            message: "Id must be a number",
        }),
    }),
});

export const getLoanIdSchema = z.object({
    params: z.object({
        id: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
            message: "Id must be a number",
        }),
    }),
});
