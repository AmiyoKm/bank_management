import { Request, Response, NextFunction } from "express";
import * as AccountService from "../../services/accounts.js";
import { HttpError } from "../../lib/errors.js";
import { AccountType } from "../../../generated/prisma/enums.js";

export const createAccount = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user) {
			return next(new HttpError(401, "Authentication required"));
		}
		const loggedInUser = req.user;
		const { type, balance, userId } = req.body;

		let finalUserId = loggedInUser.id;

		if (loggedInUser.role === "ADMIN" || loggedInUser.role === "STAFF") {
			if (userId) {
				finalUserId = userId;
			}
		} else if (userId && userId !== loggedInUser.id) {
			throw new HttpError(
				403,
				"Forbidden: You can only create accounts for yourself.",
			);
		}

		const newAccount = await AccountService.createAccount(
			type,
			balance,
			finalUserId,
		);
		res.status(201).json(newAccount);
	} catch (error) {
		next(error);
	}
};

export const getAccounts = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		let { type, name, page, limit, sort } = req.query;

		let filteredPage = 1;
		let filteredLimit = 10;
		let filteredSort = "desc";

		if (page) {
			filteredPage = parseInt(page as string, 10);
		}
		if (limit) {
			filteredLimit = parseInt(limit as string, 10);
		}
		if (sort) {
			filteredSort = sort as string;
		}
		const accounts = await AccountService.getAccounts(
			filteredPage,
			filteredLimit,
			filteredSort,
			name?.toString(),
			type as AccountType | undefined,
		);
		res.json(accounts);
	} catch (error) {
		next(error);
	}
};

export const getMyAccounts = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user) {
			return next(new HttpError(401, "Authentication required"));
		}
		const accounts = await AccountService.getMyAccounts(req.user.id);
		res.json(accounts);
	} catch (error) {
		next(error);
	}
};

export const getAccountById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user) {
			return next(new HttpError(401, "Authentication required"));
		}
		const accountId = parseInt(req.params.id, 10);
		const account = await AccountService.getAccountById(
			accountId,
			req.user,
		);
		res.json(account);
	} catch (error) {
		next(error);
	}
};

export const updateAccount = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const accountId = parseInt(req.params.id, 10);
		const { type, amount } = req.body;
		const updatedAccount = await AccountService.updateAccount(
			accountId,
			type,
			amount,
		);
		res.json(updatedAccount);
	} catch (error) {
		next(error);
	}
};

export const deleteAccount = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const accountId = parseInt(req.params.id, 10);
		await AccountService.deleteAccountById(accountId);
		res.status(204).send();
	} catch (error) {
		next(error);
	}
};
