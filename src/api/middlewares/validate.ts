import { type NextFunction, type Request, type Response } from "express";
import { ZodObject, ZodError } from "zod";

export const validate =
	(schema: ZodObject<any>) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
			});
			return next();
		} catch (error) {
			if (error instanceof ZodError) {
				return res.status(400).json(
					error.issues.map((issue) => ({
						path: issue.path,
						message: issue.message,
					})),
				);
			}
			return res.status(500).json({ message: "Internal server error" });
		}
	};
