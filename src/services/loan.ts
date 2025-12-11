import { Loan, LoanStatus, PaymentStatus } from "../../generated/prisma/client";
import { INTEREST_RATE } from "../lib/constants";
import { HttpError } from "../lib/errors";
import { generateLoanSchedule } from "../lib/helpers";
import { Role, User } from "../models/user";
import * as AccountRepository from "../repository/accounts";
import * as LoanRepository from "../repository/loan";

export const applyForLoan = async (
    userId: number,
    amount: number,
    term: number,
    disbursementAccountId: number
): Promise<Loan> => {
    const disbursementAccount = await AccountRepository.findById(
        disbursementAccountId
    );
    if (!disbursementAccount) {
        throw new HttpError(404, "Disbursement account not found");
    }

    return LoanRepository.createLoan(
        userId,
        amount,
        term,
        INTEREST_RATE,
        disbursementAccount.id
    );
};

export const approveLoan = async (loanId: number): Promise<void> => {
    const loan = await LoanRepository.findById(loanId);
    if (!loan) {
        throw new HttpError(404, "Loan not found");
    }
    if (loan.status !== LoanStatus.PENDING) {
        throw new HttpError(400, "Loan is not in PENDING status");
    }

    const schedules = generateLoanSchedule(loan);

    await LoanRepository.approveLoan(
        loan.id,
        loan.disbursementAccountId,
        loan.amount.toNumber(),
        schedules
    );
};

export const rejectLoan = async (
    loanId: number,
    adminUser: User
): Promise<void> => {
    if (adminUser.role !== Role.ADMIN && adminUser.role !== Role.STAFF) {
        throw new HttpError(
            403,
            "Forbidden: Only admins/staff can reject loans"
        );
    }
    const loan = await LoanRepository.findById(loanId);
    if (!loan) {
        throw new HttpError(404, "Loan not found");
    }
    if (loan.status !== LoanStatus.PENDING) {
        throw new HttpError(400, "Loan is not pending");
    }

    await LoanRepository.updateStatus(loanId, LoanStatus.REJECTED);
};

export const repayLoan = async (
    loanId: number,
    amount: number,
    fromAccountId: number,
    user: User,
    scheduleId: number
): Promise<void> => {
    const loan = await LoanRepository.findById(loanId);
    if (!loan) {
        throw new HttpError(404, "Loan not found");
    }
    if (user.role === Role.CUSTOMER && loan.userId !== user.id) {
        throw new HttpError(403, "Forbidden: This is not your loan");
    }
    if (
        loan.status !== LoanStatus.APPROVED &&
        loan.status !== LoanStatus.OVERDUE
    ) {
        throw new HttpError(400, "Loan is not active");
    }

    const fromAccount = await AccountRepository.findById(fromAccountId);
    if (!fromAccount) {
        throw new HttpError(404, "Payment source account not found");
    }
    if (fromAccount.userId !== user.id) {
        throw new HttpError(
            403,
            "Forbidden: Payment source is not your account"
        );
    }

    const loanWithSchedules = await LoanRepository.findById(loanId);
    if (!loanWithSchedules) throw new HttpError(404, "Loan not found");

    const schedule = loanWithSchedules.loanSchedules.find(
        (s) => s.id === scheduleId
    );
    if (!schedule) throw new HttpError(404, "Schedule not found");

    if (schedule.status === PaymentStatus.PAID) {
        throw new HttpError(400, "Schedule is already paid");
    }

    if (schedule.dueAmount.toNumber() < amount) {
        throw new HttpError(400, "Amount is greater than due amount");
    }

    await LoanRepository.repayLoan(loanId, scheduleId, fromAccountId, amount);
};

export const getLoans = async (
    page: number,
    limit: number,
    status?: LoanStatus,
    userId?: number
) => {
    return LoanRepository.findAll(page, limit, status, userId);
};

export const getLoanById = async (loanId: number, user: User) => {
    const loan = await LoanRepository.findById(loanId);
    if (!loan) throw new HttpError(404, "Loan not found");

    if (user.role === Role.CUSTOMER && loan.userId !== user.id) {
        throw new HttpError(403, "Forbidden");
    }
    return loan;
};
