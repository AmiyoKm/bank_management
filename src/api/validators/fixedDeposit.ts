import { z } from "zod";

export const createFixedDepositSchema = z.object({
    body: z.object({
        amount: z.number().positive("Amount must be positive"),
        periodInMonths: z
            .number()
            .int()
            .positive("Period must be a positive integer"),
        sourceAccountId: z.number().int().positive(),
    }),
});

export const getFixedDepositsSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        isActive: z.string().optional(),
    }),
});

export const fixedDepositIdSchema = z.object({
    params: z.object({
        id: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
            message: "Id must be a number",
        }),
    }),
});
