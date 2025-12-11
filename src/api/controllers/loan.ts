import { NextFunction, Request, Response } from "express";
import { LoanStatus } from "../../../generated/prisma/client";
import { HttpError } from "../../lib/errors";
import * as LoanService from "../../services/loan";

export const applyForLoan = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Unauthorized");
        }
        const { amount, term, disbursementAccountId } = req.body;
        const loan = await LoanService.applyForLoan(
            req.user.id,
            amount,
            term,
            disbursementAccountId
        );
        res.status(201).json(loan);
    } catch (error) {
        next(error);
    }
};

export const getAllLoans = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Unauthorized");
        }
        const { page, limit, status, userId } = req.query;

        let valiidPage = 1;
        let validLimit = 10;
        let validStatus = status as LoanStatus | undefined;
        let validUserId = userId as number | undefined;

        if (page) {
            let p = parseInt(page as string, 10);
            if (p > 0) {
                valiidPage = p;
            }
        }

        if (limit) {
            let l = parseInt(limit as string, 10);
            if (l > 0) {
                validLimit = l;
            }
        }
        if (userId) {
            let u = parseInt(userId as string, 10);
            if (u > 0) {
                validUserId = u;
            }
        }

        if (status) {
            validStatus = status as LoanStatus;
        }

        const loans = await LoanService.getLoans(
            valiidPage,
            validLimit,
            validStatus,
            validUserId
        );
        res.status(200).json(loans);
    } catch (error) {
        next(error);
    }
};

export const getMyLoans = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Unauthorized");
        }

        const { page, limit, status, userId } = req.query;

        let valiidPage = 1;
        let validLimit = 10;
        let validStatus = status as LoanStatus | undefined;
        let validUserId = userId as number | undefined;

        if (page) {
            let p = parseInt(page as string, 10);
            if (p > 0) {
                valiidPage = p;
            }
        }

        if (limit) {
            let l = parseInt(limit as string, 10);
            if (l > 0) {
                validLimit = l;
            }
        }
        if (userId) {
            let u = parseInt(userId as string, 10);
            if (u > 0) {
                validUserId = u;
            }
        }

        if (status) {
            validStatus = status as LoanStatus;
        }

        const loans = await LoanService.getLoans(
            valiidPage,
            validLimit,
            validStatus,
            req.user.id
        );

        const loansWithoutDetails = loans.map((loan) => {
            const { loanSchedules, payments, ...rest } = loan as typeof loan & {
                loanSchedules?: any[];
                payments?: any[];
            };
            return rest;
        });
        res.status(200).json(loansWithoutDetails);
    } catch (error) {
        next(error);
    }
};

export const getLoanById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Unauthorized");
        }
        const id = parseInt(req.params.id);
        const loan = await LoanService.getLoanById(id, req.user);
        res.status(200).json(loan);
    } catch (error) {
        next(error);
    }
};

export const updateLoanStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Unauthorized");
        }
        const id = parseInt(req.params.id);
        const { status } = req.body;

        if (status === LoanStatus.APPROVED) {
            await LoanService.approveLoan(id);
            res.status(200).json({ message: "Loan approved successfully" });
        } else if (status === LoanStatus.REJECTED) {
            await LoanService.rejectLoan(id, req.user);
            res.status(200).json({ message: "Loan rejected successfully" });
        } else {
            res.status(400).json({ message: "Invalid status update" });
        }
    } catch (error) {
        next(error);
    }
};

export const repayLoan = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Unauthorized");
        }
        const id = parseInt(req.params.id);
        const { amount, fromAccountId, scheduleId } = req.body;

        await LoanService.repayLoan(
            id,
            amount,
            fromAccountId,
            req.user,
            scheduleId
        );
        res.status(200).json({ message: "Repayment successful" });
    } catch (error) {
        next(error);
    }
};

export const getLoanSchedule = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Unauthorized");
        }
        const id = parseInt(req.params.id);

        const loan = await LoanService.getLoanById(id, req.user);

        res.status(200).json(loan.loanSchedules);
    } catch (error) {
        next(error);
    }
};

export const getLoanPayments = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Unauthorized");
        }
        const id = parseInt(req.params.id);

        const loan = await LoanService.getLoanById(id, req.user);

        res.status(200).json(loan.payments);
    } catch (error) {
        next(error);
    }
};
