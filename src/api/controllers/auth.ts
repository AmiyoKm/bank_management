import { Request, Response, NextFunction } from "express";
import * as UserService from "../../services/user.js";

export const register = async (
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
		);
		res.status(201).json(user);
	} catch (error) {
		next(error);
	}
};

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { email, password } = req.body;
		const user = await UserService.authenticateUser(email, password);

		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const token = UserService.signToken(user);

		res.json({ token, user });
	} catch (error) {
		next(error);
	}
};

export const getMe = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userId = req.user?.id;
		if (!userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}
		const user = await UserService.getUserById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.json(user);
	} catch (error) {
		next(error);
	}
};
