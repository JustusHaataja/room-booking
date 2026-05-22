import { Request, Response, NextFunction } from 'express';

const requests: Record<string, number[]> = {};

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip || "unknown";
  const now = Date.now();

  if (!requests[ip]) {
    requests[ip] = [];
  }

  requests[ip] = requests[ip].filter(
    (timeStamp) => now - timeStamp < 60000
  );

  requests[ip].push(now);

  if (requests[ip].length > 10) {
    res.sendStatus(429).json({ error: "Too many requests." });
  }

  if (requests[ip].length === 0) {
    delete requests[ip];
  }

  next();
}