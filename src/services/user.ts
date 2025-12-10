import crypto from "crypto";
import { promisify } from "util";
import * as UserRepo from "../repository/user.js";
import { type User, type Password, Role } from "../models/user.js";
import { Prisma } from "../../generated/prisma/client.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../lib/constants.js";
import { HttpError } from "../lib/errors.js";

const SALT_SIZE = 16;
const KEY_SIZE = 64;

const scrypt = promisify(crypto.scrypt);

const hashPassword = async (password: string): Promise<Password> => {
	const salt = crypto.randomBytes(SALT_SIZE).toString("hex");
	const derivedKey = (await scrypt(password, salt, KEY_SIZE)) as Buffer;
	const hash = `${salt}:${derivedKey.toString("hex")}`;
	return { hash };
};

const verifyPassword = async (
	password: string,
	hash: string,
): Promise<boolean> => {
	const [salt, key] = hash.split(":");
	if (!salt || !key) return false;
	const derivedKey = (await scrypt(password, salt, KEY_SIZE)) as Buffer;
	return crypto.timingSafeEqual(Buffer.from(key, "hex"), derivedKey);
};

export const createUser = async (
	email: string,
	password: string,
	firstName: string,
	lastName: string,
	role?: Role,
): Promise<User> => {
	const hashedPassword = await hashPassword(password);
	try {
		const user = await UserRepo.createUser(
			email,
			hashedPassword,
			firstName,
			lastName,
			role,
		);
		return user;
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2002"
		) {
			throw new HttpError(400, "Email already in use");
		}
		throw error;
	}
};

export const authenticateUser = async (
	email: string,
	password: string,
): Promise<User | null> => {
	const userWithPassword = await UserRepo.findUserByEmail(email);

	if (!userWithPassword) {
		throw new HttpError(400, "Invalid email or password");
	}

	const isPasswordCorrect = await verifyPassword(
		password,
		userWithPassword.password,
	);

	if (!isPasswordCorrect) {
		throw new HttpError(400, "Invalid email or password");
	}

	const { password: _, ...user } = userWithPassword;
	return user;
};

export const getUserById = async (id: number): Promise<User | null> => {
	return UserRepo.findUserById(id);
};

export const getAllUsers = async (): Promise<User[]> => {
	return UserRepo.getAllUsers();
};

export const updateUser = async (
	id: number,
	email: string,
	firstName: string,
	lastName: string,
	role: Role = Role.CUSTOMER,
): Promise<User | null> => {
	try {
		const user = await UserRepo.updateUser(
			id,
			email,
			firstName,
			lastName,
			role,
		);
		return user;
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2002"
		) {
			throw new HttpError(400, "Email already in use");
		}
		throw error;
	}
};

export const deleteUser = async (id: number): Promise<void> => {
	await UserRepo.deleteUser(id);
};

export const signToken = (user: User) => {
	return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
		expiresIn: "1d",
	});
};
