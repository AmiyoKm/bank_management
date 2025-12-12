import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
    JWT_SECRET,
    USER_CACHE_PREFIX,
    USER_CACHE_TTL,
} from "../../lib/constants.js";
import redisClient from "../../lib/redis.js";
import { Role, User } from "../../models/user.js";
import * as UserService from "../../services/user.js";

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
        const cacheKey = `${USER_CACHE_PREFIX}${decoded.id}`;
        const cachedUser = await redisClient.get(cacheKey);

        if (cachedUser) {
            req.user = JSON.parse(cachedUser) as User;
            return next();
        }
        const user = await UserService.getUserById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "Token is not valid" });
        }
        await redisClient.setEx(cacheKey, USER_CACHE_TTL, JSON.stringify(user));

        req.user = user as User;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};
