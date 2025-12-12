import { z } from "zod";
import { AccountType } from "../../../generated/prisma/client.js";

export const createAccountSchema = z.object({
    body: z.object({
        type: z.nativeEnum(AccountType),
        userId: z.number().int().positive().optional(),
        balance: z.number().min(0).optional(),
    }),
});

export const getAccountsSchema = z.object({
    query: z.object({
        type: z.nativeEnum(AccountType).optional(),
        name: z.string().min(1).max(100).optional(),
        page: z.string().min(1).optional(),
        limit: z.string().min(1).max(100).optional(),
        sort: z.enum(["asc", "desc"]).optional(),
    }),
});

export const updateAccountSchema = z.object({
    body: z.object({
        type: z.enum(["DEBIT", "CREDIT"]),
        amount: z.number().min(0),
    }),
    params: z.object({
        id: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
            message: "Id must be a number",
        }),
    }),
});

export const accountIdSchema = z.object({
    params: z.object({
        id: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
            message: "Id must be a number",
        }),
    }),
});

export type CreateAccountBody = z.infer<typeof createAccountSchema>["body"];
export type GetAccountsQuery = z.infer<typeof getAccountsSchema>["query"];
export type UpdateAccountBody = z.infer<typeof updateAccountSchema>["body"];
export type UpdateAccountParams = z.infer<typeof updateAccountSchema>["params"];
export type AccountIdParams = z.infer<typeof accountIdSchema>["params"];
