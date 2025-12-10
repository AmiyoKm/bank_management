import { Request, Response, NextFunction } from 'express';
import { Role } from '../../models/user.js';

export const authorize = (allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    }
};
