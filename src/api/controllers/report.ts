import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../lib/errors.js";
import * as ReportService from "../../services/report.js";
import type {
    AdminSummaryQuery,
    StatementParams,
    StatementQuery,
} from "../validators/report.js";

export const getAccountStatement = async (
    req: Request<StatementParams, {}, {}, StatementQuery>,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Unauthorized");
        }

        const accountId = parseInt(req.params.accountId);
        const { startDate, endDate } = req.query;

        let filteredStartDate = new Date();
        let filteredEndDate = new Date();

        if (startDate) {
            filteredStartDate = new Date(startDate as string);
            filteredStartDate.setMonth(filteredStartDate.getMonth() - 1);
        } else {
            filteredStartDate.setMonth(filteredStartDate.getMonth() - 1);
        }

        if (endDate) {
            filteredEndDate = new Date(endDate as string);
        }

        const statement = await ReportService.generateAccountStatement(
            accountId,
            filteredStartDate,
            filteredEndDate,
            req.user
        );

        res.status(200).json(statement);
    } catch (error) {
        next(error);
    }
};

export const getAdminSummaryReport = async (
    req: Request<{}, {}, {}, AdminSummaryQuery>,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Unauthorized");
        }

        const { startDate, endDate } = req.query;
        let filteredStartDate = new Date();
        let filteredEndDate = new Date();

        if (startDate) {
            filteredStartDate = new Date(startDate as string);
            filteredStartDate.setMonth(filteredStartDate.getMonth() - 1);
        } else {
            filteredStartDate.setMonth(filteredStartDate.getMonth() - 1);
        }

        if (endDate) {
            filteredEndDate = new Date(endDate as string);
        }

        const summary = await ReportService.generateAdminSummary(
            filteredStartDate,
            filteredEndDate
        );

        res.status(200).json(summary);
    } catch (error) {
        next(error);
    }
};
