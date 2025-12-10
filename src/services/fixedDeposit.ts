import { INTEREST_RATE } from "../lib/constants";
import { HttpError } from "../lib/errors";
import { Role, User } from "../models/user";
import * as AccountRepository from "../repository/accounts";
import * as FixedDepositRepository from "../repository/fixedDeposit";
import { FixedDepositWithAccount } from "../repository/fixedDeposit";

export const createFixedDeposit = async (
    userId: number,
    amount: number,
    periodInMonths: number,
    requestingUser: User,
    sourceAccountId: number
): Promise<FixedDepositWithAccount> => {
    if (requestingUser.role === Role.CUSTOMER && requestingUser.id !== userId) {
        throw new HttpError(
            403,
            "Forbidden: You can only create fixed deposits for yourself."
        );
    }

    const sourceAccount = await AccountRepository.findById(sourceAccountId);
    if (!sourceAccount) {
        throw new HttpError(404, "Source account not found");
    }
    if (sourceAccount.userId !== userId) {
        throw new HttpError(
            403,
            "Forbidden: You can only fund from your own accounts."
        );
    }

    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + periodInMonths);

    try {
        return await FixedDepositRepository.create(
            userId,
            amount,
            INTEREST_RATE,
            maturityDate,
            sourceAccountId
        );
    } catch (error: any) {
        throw new HttpError(500, error.message);
    }
};

export const getAllFixedDeposits = async (
    page: number,
    limit: number,
    isActive: boolean
): Promise<FixedDepositWithAccount[]> => {
    return FixedDepositRepository.findAll(page, limit, isActive);
};

export const getMyFixedDeposits = async (
    userId: number,
    isActive: boolean
): Promise<FixedDepositWithAccount[]> => {
    return FixedDepositRepository.findByUserId(userId, isActive);
};

export const getFixedDepositById = async (
    id: number,
    requestingUser: User
): Promise<FixedDepositWithAccount> => {
    const fd = await FixedDepositRepository.findById(id);
    if (!fd) {
        throw new HttpError(404, "Fixed deposit not found");
    }

    if (requestingUser.role === Role.CUSTOMER) {
        if (fd.account.userId !== requestingUser.id) {
            throw new HttpError(
                403,
                "Forbidden: You can only view your own fixed deposits."
            );
        }
    }

    return fd;
};

export const processMaturedFixedDeposits = async (): Promise<void> => {
    const maturedDeposits =
        await FixedDepositRepository.findMaturedActiveDeposits();

    for (const fd of maturedDeposits) {
        const start = new Date(fd.startDate).getTime();
        const end = new Date(fd.maturityDate).getTime();
        const diffYears = (end - start) / (1000 * 60 * 60 * 24 * 365.25);

        const principal = Number(fd.depositAmount);
        const rate = Number(fd.interestRate);
        const interest = principal * (rate / 100) * diffYears;

        const roundedInterest = Math.round(interest * 100) / 100;
        const finalAmount = Number(principal) + roundedInterest;

        await FixedDepositRepository.closeFixedDeposit(
            fd.id,
            finalAmount,
            roundedInterest
        );
    }
};
