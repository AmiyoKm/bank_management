import { Request, Response, NextFunction } from "express";
import * as UserService from "../../services/user.js";

export const getAllUsers = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const users = await UserService.getAllUsers();
		res.json(users);
	} catch (error) {
		next(error);
	}
};

export const getUserById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const requestedId = parseInt(req.params.id, 10);
		if (isNaN(requestedId)) {
			return res.status(400).json({ message: "Invalid user ID" });
		}

		const user = await UserService.getUserById(requestedId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(user);
	} catch (error) {
		next(error);
	}
};

export const createUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { email, password, firstName, lastName, role } = req.body;
		const user = await UserService.createUser(
			email,
			password,
			firstName,
			lastName,
			role,
		);
		res.status(201).json(user);
	} catch (error) {
		next(error);
	}
};

export const updateUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userId = parseInt(req.params.id, 10);
		const { firstName, lastName, role, email } = req.body;
		const updatedUser = await UserService.updateUser(
			userId,
			email,
			firstName,
			lastName,
			role,
		);
		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}
		res.json(updatedUser);
	} catch (error) {
		next(error);
	}
};

export const deleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userId = parseInt(req.params.id, 10);
		
		const user = await UserService.getUserById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		
		await UserService.deleteUser(userId);
		res.status(204).send();
	} catch (error) {
		next(error);
	}
};
