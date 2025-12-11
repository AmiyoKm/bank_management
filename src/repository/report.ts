import { Prisma, TransactionType } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";

export const getTransactionsForStatement = async (
    accountId: number,
    startDate: Date,
    endDate: Date
) => {
    const where: Prisma.TransactionWhereInput = {
        OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
        createdAt: {
            gte: startDate,
            lte: endDate,
        },
    };
    return prisma.transaction.findMany({
        where,
        orderBy: {
            createdAt: "asc",
        },
        include: {
            fromAccount: {
                select: { accountNumber: true },
            },
        },
    });
};

export const getNetTransactionAmountSince = async (
    accountId: number,
    sinceDate: Date
) => {
    const transactions = await prisma.transaction.findMany({
        where: {
            OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
            createdAt: {
                gte: sinceDate,
            },
        },
        select: {
            type: true,
            amount: true,
            fromAccountId: true,
            toAccountId: true,
            fee: true,
        },
    });

    let netChange = 0;

    for (const tx of transactions) {
        let change = 0;
        const amount = Number(tx.amount);
        const fee = Number(tx.fee);

        if (tx.fromAccountId === accountId) {
            if (
                tx.type === TransactionType.DEPOSIT ||
                tx.type === TransactionType.INTEREST_CREDIT ||
                tx.type === TransactionType.LOAN ||
                tx.type === TransactionType.FIXED_DEPOSIT_WITHDRAWAL
            ) {
                change += amount;
            } else {
                change -= amount;
                if (fee > 0) change -= fee;
            }
        } else if (tx.toAccountId === accountId) {
            change += amount;
        }

        netChange += change;
    }

    return netChange;
};

export const getBankStats = async (startDate?: Date, endDate?: Date) => {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    const [
        totalUsers,
        totalAccounts,
        totalLoans,
        totalLiquidityRaw,
        transactionCount,
        transactionVolumeRaw,
    ] = await Promise.all([
        prisma.user.count({
            where: startDate || endDate ? { createdAt: dateFilter } : undefined,
        }),
        prisma.account.count({
            where: startDate || endDate ? { createdAt: dateFilter } : undefined,
        }),
        prisma.loan.count({
            where: startDate || endDate ? { createdAt: dateFilter } : undefined,
        }),
        prisma.account.aggregate({
            _sum: { balance: true },
        }),
        prisma.transaction.count({
            where: startDate || endDate ? { createdAt: dateFilter } : undefined,
        }),
        prisma.transaction.aggregate({
            _sum: { amount: true },
            where: startDate || endDate ? { createdAt: dateFilter } : undefined,
        }),
    ]);

    return {
        totalUsers,
        totalAccounts,
        totalLoans,
        totalLiquidity: Number(totalLiquidityRaw._sum.balance ?? 0),
        transactionCount,
        transactionVolume: Number(transactionVolumeRaw._sum.amount ?? 0),
    };
};
