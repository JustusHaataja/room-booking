import { Request, Response, NextFunction } from 'express';

/**
* CORS middleware - allow all origins (for POC)
* In production, restrict to specific origins
*/
export const corsMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
        return;
    }

    next();
}