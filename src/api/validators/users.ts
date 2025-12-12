import { z } from "zod";
import { Role } from "../../models/user.js";

export const createUserSchema = z.object({
    body: z.object({
        firstName: z.string().min(1, { message: "First name is required" }),
        lastName: z.string().min(1, { message: "Last name is required" }),
        email: z.string().email({ message: "Invalid email address" }),
        password: z
            .string()
            .min(6, { message: "Password must be at least 6 characters long" })
            .max(16, { message: "Password must be less than 16 characters" }),
        role: z.nativeEnum(Role).optional(),
    }),
});

export const updateUserSchema = z.object({
    body: z.object({
        firstName: z.string().min(1, { message: "First name is required" }),
        lastName: z.string().min(1, { message: "Last name is required" }),
        email: z.string().email({ message: "Invalid email address" }),
        role: z.nativeEnum(Role).optional(),
    }),
});

export const userParamsSchema = z.object({
    params: z.object({
        id: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
            message: "User ID must be an integer",
        }),
    }),
});

export type CreateUserBody = z.infer<typeof createUserSchema>["body"];
export type UpdateUserBody = z.infer<typeof updateUserSchema>["body"];
export type UserParams = z.infer<typeof userParamsSchema>["params"];
