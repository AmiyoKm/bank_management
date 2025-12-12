import bcrypt from "bcrypt";
import { User as PrismaUser, Role } from "../../generated/prisma/client.js";
export { Role };

export type User = Omit<PrismaUser, "password">;

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
};

export const verifyPassword = async (
    password: string,
    hash: string
): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};
