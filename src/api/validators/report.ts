import { z } from "zod";

export const statementSchema = z.object({
    params: z.object({
        accountId: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
            message: "Account ID must be a number",
        }),
    }),
    query: z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
    }),
});

export const adminSummarySchema = z.object({
    query: z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
    }),
});

export type StatementParams = z.infer<typeof statementSchema>["params"];
export type StatementQuery = z.infer<typeof statementSchema>["query"];
export type AdminSummaryQuery = z.infer<typeof adminSummarySchema>["query"];
