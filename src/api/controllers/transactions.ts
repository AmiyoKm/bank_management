import { NextFunction, Request, Response } from "express";
import { TransactionType } from "../../../generated/prisma/enums.js";
import { HttpError } from "../../lib/errors.js";
import * as TransactionService from "../../services/transactions.js";
import type {
    DepositBody,
    ExternalTransferBody,
    GetTransactionsQuery,
    TransactionIdParams,
    TransferBody,
    WithdrawBody,
} from "../validators/transactions.js";

export const deposit = async (
    req: Request<{}, {}, DepositBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return next(new HttpError(401, "Authentication required"));
        }
        const { accountId, amount, description } = req.body;
        const transaction = await TransactionService.createDeposit(
            Number(accountId),
            Number(amount),
            description,
            req.user
        );
        res.status(201).json(transaction);
    } catch (error) {
        next(error);
    }
};

export const withdraw = async (
    req: Request<{}, {}, WithdrawBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return next(new HttpError(401, "Authentication required"));
        }
        const { accountId, amount, description } = req.body;
        const transaction = await TransactionService.createWithdrawal(
            Number(accountId),
            Number(amount),
            description,
            req.user
        );
        res.status(201).json(transaction);
    } catch (error) {
        next(error);
    }
};

export const transfer = async (
    req: Request<{}, {}, TransferBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return next(new HttpError(401, "Authentication required"));
        }
        const { fromAccountId, toAccountId, amount, description } = req.body;

        if (fromAccountId == toAccountId) {
            return next(
                new HttpError(400, "Cannot transfer to the same account")
            );
        }

        const transaction = await TransactionService.createTransfer(
            Number(fromAccountId),
            Number(toAccountId),
            Number(amount),
            description
        );
        res.status(201).json(transaction);
    } catch (error) {
        next(error);
    }
};

export const externalTransfer = async (
    req: Request<{}, {}, ExternalTransferBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return next(new HttpError(401, "Authentication required"));
        }
        const {
            fromAccountId,
            amount,
            toExternalAccountNumber,
            toExternalRoutingNumber,
            description,
        } = req.body;
        const transaction = await TransactionService.createExternalTransfer(
            Number(fromAccountId),
            Number(amount),
            toExternalAccountNumber,
            toExternalRoutingNumber,
            description,
            req.user
        );
        res.status(201).json(transaction);
    } catch (error) {
        next(error);
    }
};

export const getTransactions = async (
    req: Request<{}, {}, {}, GetTransactionsQuery>,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return next(new HttpError(401, "Authentication required"));
        }
        const { accountId, type, startDate, endDate, page, limit, sort } =
            req.query;

        let filteredPage = 1;
        let filteredLimit = 10;
        let filteredSort = "desc";
        let filteredAccountId: number | undefined = undefined;
        let filteredType: TransactionType | undefined = undefined;
        let filteredStartDate: Date | undefined = undefined;
        let filteredEndDate: Date | undefined = undefined;

        if (page) filteredPage = parseInt(page as string, 10);
        if (limit) filteredLimit = parseInt(limit as string, 10);
        if (sort) filteredSort = sort as string;
        if (accountId) filteredAccountId = Number(accountId);
        if (type) filteredType = type as TransactionType;
        if (startDate) filteredStartDate = new Date(startDate as string);
        if (endDate) filteredEndDate = new Date(endDate as string);

        const transactions = await TransactionService.getTransactions(
            filteredPage,
            filteredLimit,
            filteredSort,
            req.user,
            {
                accountId: filteredAccountId,
                type: filteredType,
                startDate: filteredStartDate,
                endDate: filteredEndDate,
            }
        );
        res.json(transactions);
    } catch (error) {
        next(error);
    }
};

export const getTransactionById = async (
    req: Request<TransactionIdParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return next(new HttpError(401, "Authentication required"));
        }
        const id = parseInt(req.params.id, 10);
        const transaction = await TransactionService.getTransactionById(
            id,
            req.user
        );
        res.json(transaction);
    } catch (error) {
        next(error);
    }
};
