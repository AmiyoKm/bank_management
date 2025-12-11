import {
    Prisma,
    Transaction,
    TransactionType,
} from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export const createTransaction = async (
    amount: number,
    type: TransactionType,
    fromAccountId: number,
    toAccountId?: number,
    description?: string
): Promise<Transaction> => {
    return prisma.transaction.create({
        data: {
            amount,
            type,
            fromAccountId,
            toAccountId,
            description,
        },
    });
};

export const findAll = async (
    page: number,
    limit: number,
    sort: string,
    accountId?: number,
    type?: TransactionType,
    startDate?: Date,
    endDate?: Date
): Promise<Transaction[]> => {
    const where: Prisma.TransactionWhereInput = {};
    if (accountId) {
        where.OR = [{ fromAccountId: accountId }, { toAccountId: accountId }];
    }
    if (type) {
        where.type = type;
    }
    if (startDate || endDate) {
        where.createdAt = {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
        };
    }

    return prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
        },
        include: {
            fromAccount: {
                select: {
                    accountNumber: true,
                },
            },
        },
    });
};

export const findById = async (id: number): Promise<Transaction | null> => {
    return prisma.transaction.findUnique({
        where: { id },
    });
};

export const countTransactions = async (
    accountId?: number,
    type?: TransactionType,
    startDate?: Date,
    endDate?: Date
): Promise<number> => {
    const where: Prisma.TransactionWhereInput = {};
    if (accountId) {
        where.OR = [{ fromAccountId: accountId }, { toAccountId: accountId }];
    }
    if (type) {
        where.type = type;
    }
    if (startDate || endDate) {
        where.createdAt = {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
        };
    }

    return prisma.transaction.count({ where });
};

export const performTransfer = async (
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    description?: string
) => {
    return prisma.$transaction(async (tx) => {
        const sender = await tx.account.update({
            where: { id: fromAccountId },
            data: {
                balance: {
                    decrement: amount,
                },
            },
        });

        if (sender.balance.toNumber() < 0) {
            throw new Error("Insufficient funds");
        }

        await tx.account.update({
            where: { id: toAccountId },
            data: {
                balance: {
                    increment: amount,
                },
            },
        });

        return tx.transaction.create({
            data: {
                amount,
                type: TransactionType.TRANSFER,
                fromAccountId,
                toAccountId,
                description,
            },
        });
    });
};

export const performDeposit = async (
    accountId: number,
    amount: number,
    description?: string
) => {
    return prisma.$transaction(async (tx) => {
        await tx.account.update({
            where: { id: accountId },
            data: { balance: { increment: amount } },
        });

        return tx.transaction.create({
            data: {
                amount,
                type: TransactionType.DEPOSIT,
                fromAccountId: accountId,
                description,
            },
        });
    });
};

export const performWithdrawal = async (
    accountId: number,
    amount: number,
    description?: string
) => {
    return prisma.$transaction(async (tx) => {
        const account = await tx.account.findUnique({
            where: { id: accountId },
        });
        if (!account || Number(account.balance) < amount) {
            throw new Error("Insufficient funds");
        }

        await tx.account.update({
            where: { id: accountId },
            data: { balance: { decrement: amount } },
        });

        return tx.transaction.create({
            data: {
                amount,
                type: TransactionType.WITHDRAWAL,
                fromAccountId: accountId,
                description,
            },
        });
    });
};

export const performExternalTransfer = async (
    fromAccountId: number,
    amount: number,
    toExternalAccountNumber: string,
    toExternalRoutingNumber: string,
    description?: string
) => {
    return prisma.$transaction(async (tx) => {
        const account = await tx.account.findUnique({
            where: { id: fromAccountId },
        });
        if (!account || Number(account.balance) < amount) {
            throw new Error("Insufficient funds");
        }

        await tx.account.update({
            where: { id: fromAccountId },
            data: { balance: { decrement: amount } },
        });

        return tx.transaction.create({
            data: {
                amount,
                type: TransactionType.TRANSFER,
                fromAccountId,
                toExternalAccountNumber,
                toExternalRoutingNumber,
                description,
            },
        });
    });
};
