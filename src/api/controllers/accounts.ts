import { NextFunction, Request, Response } from "express";
import { AccountType } from "../../../generated/prisma/enums.js";
import { HttpError } from "../../lib/errors.js";
import * as AccountService from "../../services/accounts.js";
import type {
    AccountIdParams,
    CreateAccountBody,
    GetAccountsQuery,
    UpdateAccountBody,
    UpdateAccountParams,
} from "../validators/accounts.js";

export const createAccount = async (
    req: Request<{}, {}, CreateAccountBody>,
    res: Response,
    next: NextFunction
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
                "Forbidden: You can only create accounts for yourself."
            );
        }

        const newAccount = await AccountService.createAccount(
            type,
            balance ?? 0,
            finalUserId
        );
        res.status(201).json(newAccount);
    } catch (error) {
        next(error);
    }
};

export const getAccounts = async (
    req: Request<{}, {}, {}, GetAccountsQuery>,
    res: Response,
    next: NextFunction
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
            type as AccountType | undefined
        );
        res.json(accounts);
    } catch (error) {
        next(error);
    }
};

export const getMyAccounts = async (
    req: Request,
    res: Response,
    next: NextFunction
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
    req: Request<AccountIdParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return next(new HttpError(401, "Authentication required"));
        }
        const accountId = req.params.id;
        const accountIdNumber = parseInt(accountId, 10);
        if (isNaN(accountIdNumber)) {
            return next(new HttpError(400, "Invalid account ID"));
        }
        const account = await AccountService.getAccountById(
            accountIdNumber,
            req.user
        );
        res.json(account);
    } catch (error) {
        next(error);
    }
};

export const updateAccount = async (
    req: Request<UpdateAccountParams, {}, UpdateAccountBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.params.id;
        const { type, amount } = req.body;
        const accountIdNumber = parseInt(accountId, 10);
        if (isNaN(accountIdNumber)) {
            return next(new HttpError(400, "Invalid account ID"));
        }
        const updatedAccount = await AccountService.updateAccount(
            accountIdNumber,
            type,
            amount
        );
        res.json(updatedAccount);
    } catch (error) {
        next(error);
    }
};

export const deleteAccount = async (
    req: Request<AccountIdParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.params.id;

        const accountIdNumber = parseInt(accountId, 10);
        if (isNaN(accountIdNumber)) {
            return next(new HttpError(400, "Invalid account ID"));
        }

        await AccountService.deleteAccountById(accountIdNumber);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
