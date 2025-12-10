import { prisma } from "../lib/prisma.js";
import { type User, type Password, Role } from "../models/user.js";
import type { User as PrismaUser } from "../../generated/prisma/client.js";

export const createUser = async (
	email: string,
	password: Password,
	firstName: string,
	lastName: string,
	role: Role = Role.CUSTOMER,
): Promise<User> => {
	const user = await prisma.user.create({
		data: {
			email,
			password: password.hash,
			firstName,
			lastName,
			role,
		},
	});
	const { password: _, ...result } = user;
	return result;
};

export const findUserByEmail = async (
	email: string,
): Promise<PrismaUser | null> => {
	return prisma.user.findUnique({
		where: { email },
	});
};

export const findUserById = async (id: number): Promise<User | null> => {
	const user = await prisma.user.findUnique({
		where: { id },
	});
	if (!user) {
		return null;
	}
	const { password: _, ...result } = user;
	return result;
};

export const getAllUsers = async (): Promise<User[]> => {
	const users = await prisma.user.findMany();
	return users.map((user) => {
		const { password: _, ...result } = user;
		return result;
	});
};

export const updateUser = async (
	id: number,
	email: string,
	firstName: string,
	lastName: string,
	role: Role,
): Promise<User> => {
	const user = await prisma.user.update({
		where: { id },
		data: {
			email,
			firstName,
			lastName,
			role,
		},
	});
	const { password: _, ...result } = user;
	return result;
};

export const deleteUser = async (id: number): Promise<void> => {
	await prisma.user.delete({
		where: { id },
	});
};
