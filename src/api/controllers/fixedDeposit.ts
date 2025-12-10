import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../lib/errors";
import * as FixedDepositService from "../../services/fixedDeposit";

export const createFixedDeposit = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return next(new HttpError(401, "Authentication required"));
        }
        const { amount, periodInMonths, sourceAccountId } = req.body;

        const fd = await FixedDepositService.createFixedDeposit(
            req.user.id,
            Number(amount),
            Number(periodInMonths),
            req.user,
            Number(sourceAccountId)
        );
        res.status(201).json(fd);
    } catch (error) {
        next(error);
    }
};

export const getAllFixedDeposits = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { page, limit, isActive } = req.query;
        const validPage = page ? Number(page) : 1;
        const validLimit = limit ? Number(limit) : 10;
        let isActiveBool = true;
        if (isActive === "false") isActiveBool = false;

        const fds = await FixedDepositService.getAllFixedDeposits(
            validPage,
            validLimit,
            isActiveBool
        );
        res.json(fds);
    } catch (error) {
        next(error);
    }
};

export const getMyFixedDeposits = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return next(new HttpError(401, "Authentication required"));
        }
        const { isActive } = req.query;
        let isActiveBool = true;
        if (isActive === "false") isActiveBool = false;

        const fds = await FixedDepositService.getMyFixedDeposits(
            req.user.id,
            isActiveBool
        );
        res.json(fds);
    } catch (error) {
        next(error);
    }
};

export const getFixedDepositById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return next(new HttpError(401, "Authentication required"));
        }
        const id = parseInt(req.params.id, 10);
        const fd = await FixedDepositService.getFixedDepositById(id, req.user);
        res.json(fd);
    } catch (error) {
        next(error);
    }
};

export const processMaturity = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await FixedDepositService.processMaturedFixedDeposits();
        res.json({ message: "Matured fixed deposits processed successfully." });
    } catch (error) {
        next(error);
    }
};
