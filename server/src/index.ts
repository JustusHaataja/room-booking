import express, { Request, Response, NextFunction } from 'express';
import { corsMiddleware } from './middleware/cors';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import bookingRouter from './routes/bookings';
import roomsRouter from './routes/rooms';
import { ApiError } from './services/booking.service';
import { ZodError } from 'zod';

const app = express();
const PORT = 8000;

// ==================== MIDDLEWARE =====================

// Parse JSON request bodies
app.use(express.json());

// CORS middleware
app.use(corsMiddleware);
app.use(rateLimiter);

// Request timing middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path}  (${duration}ms)`);
    });
    
    next();
});

// ================ HEALTH CHECK ROUTES ================

/**
*   GET /
* Root endpoint - API health check 
*/
app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
        status: "Online",
        service: "Meeting Room Reservation API",
        version: "1.0.0",
    });
})

/**
*   GET /health
* Health check endpoint
*/
app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "healthy" });
})


// ==================== API ROUTES =====================

// Register bookings router with /api prefix
app.use("/api", bookingRouter);

// Register rooms router with /api prefix
app.use("/api", roomsRouter);


// ================== ERROR HANDLING ===================

// 404 handler (no route matched)
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        error: "Not Found",
        status: 404,
    });
})

// Global error handler
app.use((err: Error | ZodError | ApiError, _req: Request, res: Response, _next: NextFunction) => {
    errorHandler(err, _req, res, _next);
});


// =================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  Meeting Room Reservation API                         ║
║  Running on http://localhost:${PORT}                     ║
╚═══════════════════════════════════════════════════════╝
  `);
})