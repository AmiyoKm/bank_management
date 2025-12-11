import {
    AccountType,
    Prisma,
    TransactionType,
} from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export const create = async (
    userId: number,
    depositAmount: number,
    interestRate: number,
    maturityDate: Date,
    sourceAccountId: number
): Promise<FixedDepositWithAccount> => {
    return prisma.$transaction(async (tx) => {
        const sourceAccount = await tx.account.findUnique({
            where: { id: sourceAccountId },
        });

        if (!sourceAccount) {
            throw new Error("Source account not found");
        }

        if (Number(sourceAccount.balance) < depositAmount) {
            throw new Error("Insufficient funds in source account");
        }

        await tx.account.update({
            where: { id: sourceAccountId },
            data: {
                balance: {
                    decrement: depositAmount,
                },
            },
        });

        const accountNumber = `FD-${Date.now()}-${Math.floor(
            Math.random() * 1000
        )}`;

        const account = await tx.account.create({
            data: {
                userId,
                accountNumber,
                type: AccountType.FIXED_DEPOSIT,
                balance: depositAmount,
                currency: "BDT",
            },
        });

        await tx.transaction.create({
            data: {
                type: TransactionType.FIXED_DEPOSIT,
                amount: depositAmount,
                fromAccountId: sourceAccountId,
                toAccountId: account.id,
            },
        });

        return tx.fixedDeposit.create({
            data: {
                accountId: account.id,
                depositAmount,
                interestRate,
                maturityDate,
            },
            include: {
                account: true,
            },
        });
    });
};

export const findAll = async (
    page: number,
    limit: number,
    isActive: boolean
): Promise<FixedDepositWithAccount[]> => {
    const where: Prisma.FixedDepositWhereInput = {};
    where.isActive = isActive;

    return prisma.fixedDeposit.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
            account: {
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            startDate: "desc",
        },
    });
};

export type FixedDepositWithAccount = Prisma.FixedDepositGetPayload<{
    include: { account: true };
}>;

export const findById = async (
    id: number
): Promise<FixedDepositWithAccount | null> => {
    return prisma.fixedDeposit.findUnique({
        where: { id },
        include: {
            account: true,
        },
    });
};

export const findByUserId = async (
    userId: number,
    isActive: boolean
): Promise<FixedDepositWithAccount[]> => {
    const where: Prisma.FixedDepositWhereInput = {
        account: {
            userId,
        },
    };
    where.isActive = isActive;

    return prisma.fixedDeposit.findMany({
        where,
        include: {
            account: true,
        },
        orderBy: {
            startDate: "desc",
        },
    });
};

export const findMaturedActiveDeposits = async (): Promise<
    FixedDepositWithAccount[]
> => {
    return prisma.fixedDeposit.findMany({
        where: {
            isActive: true,
            maturityDate: {
                lte: new Date(),
            },
        },
        include: {
            account: true,
        },
    });
};

export const closeFixedDeposit = async (
    fdId: number,
    finalAmount: number,
    interestAmount: number
): Promise<void> => {
    return prisma.$transaction(async (tx) => {
        const fd = await tx.fixedDeposit.findUnique({
            where: { id: fdId },
            include: { account: true },
        });

        if (!fd) {
            throw new Error(`Fixed Deposit ${fdId} not found`);
        }

        await tx.fixedDeposit.update({
            where: { id: fdId },
            data: { isActive: false },
        });

        const userAccounts = await tx.account.findMany({
            where: {
                userId: fd.account.userId,
                type: { in: [AccountType.SAVINGS, AccountType.CHECKING] },
            },
        });

        let targetAccountId = userAccounts[0]?.id;

        if (!targetAccountId) {
            targetAccountId = fd.accountId;
        }
        const amountToAdd =
            targetAccountId !== fd.accountId ? finalAmount : interestAmount;

        await tx.account.update({
            where: { id: targetAccountId },
            data: {
                balance: {
                    increment: amountToAdd,
                },
            },
        });

        if (targetAccountId !== fd.accountId) {
            await tx.account.update({
                where: { id: fd.accountId },
                data: { balance: 0 },
            });
        }

        await tx.transaction.create({
            data: {
                type: TransactionType.INTEREST_CREDIT,
                amount: interestAmount,
                toAccountId: targetAccountId,
                description: `Interest payout for FD #${fdId}`,
                fromAccountId: fd.accountId,
            },
        });

        if (targetAccountId !== fd.accountId) {
            await tx.transaction.create({
                data: {
                    type: TransactionType.TRANSFER,
                    amount: Number(fd.depositAmount),
                    fromAccountId: fd.accountId,
                    toAccountId: targetAccountId,
                    description: `Maturity payout for FD #${fdId}`,
                },
            });
        }
    });
};
