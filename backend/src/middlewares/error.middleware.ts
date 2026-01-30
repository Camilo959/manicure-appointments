import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    console.error(err);

    return res.status(500).json({
        message: 'Internal server error',
    });
};
