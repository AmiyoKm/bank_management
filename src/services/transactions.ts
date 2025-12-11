import { Transaction, TransactionType } from "../../generated/prisma/client.js";
import { HttpError } from "../lib/errors.js";
import { Role, User } from "../models/user.js";
import * as AccountRepository from "../repository/accounts.js";
import * as TransactionRepository from "../repository/transactions.js";

export const createDeposit = async (
    accountId: number,
    amount: number,
    description: string | undefined,
    requestingUser: User
): Promise<Transaction> => {
    const account = await AccountRepository.findById(accountId);
    if (!account) {
        throw new HttpError(404, "Account not found");
    }
    if (
        requestingUser.role === Role.CUSTOMER &&
        account.userId !== requestingUser.id
    ) {
        throw new HttpError(
            403,
            "Forbidden: You can only deposit to your own accounts."
        );
    }

    return TransactionRepository.performDeposit(accountId, amount, description);
};

export const createWithdrawal = async (
    accountId: number,
    amount: number,
    description: string | undefined,
    requestingUser: User
): Promise<Transaction> => {
    const account = await AccountRepository.findById(accountId);
    if (!account) {
        throw new HttpError(404, "Account not found");
    }

    if (
        requestingUser.role === Role.CUSTOMER &&
        account.userId !== requestingUser.id
    ) {
        throw new HttpError(
            403,
            "Forbidden: You can only withdraw from your own accounts."
        );
    }

    return TransactionRepository.performWithdrawal(
        accountId,
        amount,
        description
    );
};

export const createTransfer = async (
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    description: string | undefined,
): Promise<Transaction> => {
    const fromAccount = await AccountRepository.findById(fromAccountId);
    if (!fromAccount) {
        throw new HttpError(404, "Source account not found");
    }

    const toAccount = await AccountRepository.findById(toAccountId);
    if (!toAccount) {
        throw new HttpError(404, "Destination account not found");
    }

    return TransactionRepository.performTransfer(
        fromAccountId,
        toAccountId,
        amount,
        description
    );
};

export const createExternalTransfer = async (
    fromAccountId: number,
    amount: number,
    toExternalAccountNumber: string,
    toExternalRoutingNumber: string,
    description: string | undefined,
    requestingUser: User
): Promise<Transaction> => {
    const fromAccount = await AccountRepository.findById(fromAccountId);
    if (!fromAccount) {
        throw new HttpError(404, "Source account not found");
    }

    if (
        requestingUser.role === Role.CUSTOMER &&
        fromAccount.userId !== requestingUser.id
    ) {
        throw new HttpError(
            403,
            "Forbidden: You can only transfer from your own accounts."
        );
    }

    return TransactionRepository.performExternalTransfer(
        fromAccountId,
        amount,
        toExternalAccountNumber,
        toExternalRoutingNumber,
        description
    );
};

export const getTransactions = async (
    page: number,
    limit: number,
    sort: string,
    requestingUser: User,
    filters: {
        accountId?: number;
        type?: TransactionType;
        startDate?: Date;
        endDate?: Date;
    }
): Promise<Transaction[]> => {
    if (filters.accountId) {
        const account = await AccountRepository.findById(filters.accountId);
        if (!account) {
            throw new HttpError(404, "Account not found");
        }
        if (
            requestingUser.role === Role.CUSTOMER &&
            account.userId !== requestingUser.id
        ) {
            throw new HttpError(
                403,
                "Forbidden: You can only view transactions for your own accounts."
            );
        }
        return TransactionRepository.findAll(
            page,
            limit,
            sort,
            filters.accountId,
            filters.type,
            filters.startDate,
            filters.endDate
        );
    }

    if (requestingUser.role === Role.CUSTOMER) {
        throw new HttpError(
            400,
            "Account ID is required to view transaction history."
        );
    }

    // for admins and staff
    return TransactionRepository.findAll(
        page,
        limit,
        sort,
        undefined,
        filters.type,
        filters.startDate,
        filters.endDate
    );
};

export const getTransactionById = async (
    id: number,
    requestingUser: User
): Promise<Transaction> => {
    const transaction = await TransactionRepository.findById(id);
    if (!transaction) {
        throw new HttpError(404, "Transaction not found");
    }

    let hasAccess = false;
    if (requestingUser.role !== Role.CUSTOMER) {
        hasAccess = true;
    } else {
        const fromAccount = await AccountRepository.findById(
            transaction.fromAccountId
        );
        if (fromAccount && fromAccount.userId === requestingUser.id) {
            hasAccess = true;
        } else if (transaction.toAccountId) {
            const toAccount = await AccountRepository.findById(
                transaction.toAccountId
            );
            if (toAccount && toAccount.userId === requestingUser.id) {
                hasAccess = true;
            }
        }
    }

    if (!hasAccess) {
        throw new HttpError(
            403,
            "Forbidden: You cannot view this transaction."
        );
    }

    return transaction;
};
