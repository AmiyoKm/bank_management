import {
    AccountType,
    Loan,
    LoanStatus,
    PaymentStatus,
    Prisma,
    Transaction,
    TransactionType,
} from "../../generated/prisma/client.js";
import { generateAccountNumber } from "../lib/helpers.js";
import { prisma } from "../lib/prisma.js";

export const createLoan = async (
    userId: number,
    amount: number,
    term: number,
    interestRate: number,
    disbursementAccountId: number
): Promise<Loan> => {
    return prisma.$transaction(async (tx) => {
        const accountNumber = generateAccountNumber("LN");

        const account = await tx.account.create({
            data: {
                userId,
                type: AccountType.LOAN,
                balance: 0,
                accountNumber,
            },
        });

        return tx.loan.create({
            data: {
                userId,
                accountId: account.id,
                amount,
                interestRate,
                term,
                status: LoanStatus.PENDING,
                disbursementAccountId,
            },
        });
    });
};

export const updateStatus = async (
    loanId: number,
    status: LoanStatus
): Promise<Loan> => {
    return prisma.loan.update({
        where: { id: loanId },
        data: { status },
    });
};

export const createSchedule = async (
    schedules: Prisma.LoanScheduleCreateManyInput[]
) => {
    return prisma.loanSchedule.createMany({
        data: schedules,
    });
};

export const findById = async (id: number) => {
    return prisma.loan.findUnique({
        where: { id },
        include: {
            account: true,
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            loanSchedules: {
                orderBy: { dueDate: "asc" },
            },
            payments: {
                orderBy: { paymentDate: "desc" },
            },
        },
    });
};

export const findAll = async (
    page: number,
    limit: number,
    status?: LoanStatus,
    userId?: number
): Promise<Loan[]> => {
    const where: Prisma.LoanWhereInput = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    return prisma.loan.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            loanSchedules: {
                orderBy: { dueDate: "asc" },
            },
            payments: {
                orderBy: { paymentDate: "desc" },
            },
        },
    });
};

export const findByUserId = async (userId: number): Promise<Loan[]> => {
    return prisma.loan.findMany({
        where: { userId },
        include: {
            loanSchedules: {
                orderBy: { dueDate: "asc" },
            },
            payments: {
                orderBy: { paymentDate: "desc" },
            },
        },
        orderBy: { createdAt: "desc" },
    });
};

export const approveLoan = async (
    loanId: number,
    disbursementAccountId: number,
    amount: number,
    schedules: Prisma.LoanScheduleCreateManyInput[]
): Promise<void> => {
    await prisma.$transaction(async (tx) => {
        await tx.loan.update({
            where: { id: loanId },
            data: { status: LoanStatus.APPROVED },
        });

        await tx.loanSchedule.createMany({
            data: schedules,
        });
        await tx.account.update({
            where: { id: disbursementAccountId },
            data: { balance: { increment: amount } },
        });

        await tx.transaction.create({
            data: {
                amount,
                type: TransactionType.LOAN,
                fromAccountId: disbursementAccountId,
                description: `Loan Disbursement for Loan #${loanId}`,
            },
        });
    });
};

export const repayLoan = async (
    loanId: number,
    scheduleId: number,
    fromAccountId: number,
    amount: number
): Promise<Transaction> => {
    return prisma.$transaction(async (tx) => {
        const schedule = await tx.loanSchedule.findUnique({
            where: { id: scheduleId },
        });

        if (!schedule) throw new Error("Loan schedule not found");
        if (schedule.loanId !== loanId)
            throw new Error("Schedule does not match loan");
        if (schedule.status === PaymentStatus.PAID)
            throw new Error("Schedule already paid");

        const account = await tx.account.findUnique({
            where: { id: fromAccountId },
        });

        if (!account || Number(account.balance) < amount) {
            throw new Error("Insufficient funds for repayment");
        }

        await tx.account.update({
            where: { id: fromAccountId },
            data: { balance: { decrement: amount } },
        });

        await tx.loanSchedule.update({
            where: { id: scheduleId },
            data: {
                status: PaymentStatus.PAID,
                paidAmount: amount,
                paidAt: new Date(),
            },
        });

        const transaction = await tx.transaction.create({
            data: {
                amount,
                type: TransactionType.LOAN_PAYMENT,
                fromAccountId: fromAccountId,
                description: `Repayment for Loan #${loanId} Schedule #${scheduleId}`,
            },
        });

        await tx.loanPayment.create({
            data: {
                loanId,
                amount,
                paymentDate: new Date(),
            },
        });

        const remainingUnpaid = await tx.loanSchedule.count({
            where: {
                loanId,
                status: { not: PaymentStatus.PAID },
            },
        });

        if (remainingUnpaid === 0) {
            await tx.loan.update({
                where: { id: loanId },
                data: { status: LoanStatus.PAID },
            });
        }

        return transaction;
    });
};
