import { TransactionType } from "../../generated/prisma/client.js";
import { HttpError } from "../lib/errors.js";
import { Role, User } from "../models/user.js";
import * as AccountRepository from "../repository/accounts.js";
import * as ReportRepository from "../repository/report.js";

export const generateAccountStatement = async (
    accountId: number,
    startDate: Date,
    endDate: Date,
    requestingUser: User
) => {
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
            "Forbidden: You can only view statements for your own accounts."
        );
    }

    const currentBalance = Number(account.balance);

    const netMovementSinceStart =
        await ReportRepository.getNetTransactionAmountSince(
            accountId,
            startDate
        );

    const openingBalance = currentBalance - netMovementSinceStart;
    const transactions = await ReportRepository.getTransactionsForStatement(
        accountId,
        startDate,
        endDate
    );

    let runningBalance = openingBalance;
    const statementItems = transactions.map((tx) => {
        const amount = Number(tx.amount);
        const fee = Number(tx.fee);
        let credit = 0;
        let debit = 0;

        if (tx.fromAccountId === accountId) {
            if (
                tx.type === TransactionType.DEPOSIT ||
                tx.type === TransactionType.INTEREST_CREDIT ||
                tx.type === TransactionType.LOAN ||
                tx.type === TransactionType.FIXED_DEPOSIT_WITHDRAWAL
            ) {
                credit = amount;
            } else {
                debit = amount;
                if (fee > 0) debit += fee;
            }
        } else if (tx.toAccountId === accountId) {
            credit = amount;
        }

        runningBalance = runningBalance + credit - debit;

        return {
            id: tx.id,
            date: tx.createdAt,
            type: tx.type,
            description: tx.description,
            amount: amount,
            fee: fee,
            credit: credit > 0 ? credit : null,
            debit: debit > 0 ? debit : null,
            balance: runningBalance,
            counterparty: tx.toExternalAccountNumber
                ? `Ext: ${tx.toExternalAccountNumber}`
                : tx.toAccountId === accountId
                ? `From Acc: ${tx.fromAccountId}`
                : tx.toAccountId
                ? `To Acc: ${tx.toAccountId}`
                : null,
        };
    });

    return {
        account: {
            id: account.id,
            accountNumber: account.accountNumber,
            type: account.type,
            currency: account.currency,
        },
        period: {
            startDate,
            endDate,
        },
        openingBalance,
        closingBalance: runningBalance,
        transactions: statementItems,
    };
};

export const generateAdminSummary = async (
    startDate?: Date,
    endDate?: Date
) => {
    return ReportRepository.getBankStats(startDate, endDate);
};
