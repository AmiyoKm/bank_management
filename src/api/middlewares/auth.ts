import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as UserService from "../../services/user.js";
import { Role, User } from "../../models/user.js";
import { JWT_SECRET } from "../../lib/constants.js";

interface JwtPayload {
	id: number;
	role: Role;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res
				.status(401)
				.json({ message: "No token provided, authorization denied" });
		}

		const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

		const user = await UserService.getUserById(decoded.id);

		if (!user) {
			return res.status(401).json({ message: "Token is not valid" });
		}

		req.user = user as User;
		next();
	} catch (error) {
		res.status(401).json({ message: "Token is not valid" });
	}
};
