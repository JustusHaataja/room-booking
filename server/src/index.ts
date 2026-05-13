import express, { Request, Response, NextFunction } from 'express';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import router from './routes/bookings';
import { ApiError } from './services/booking.service';
import { ZodError } from 'zod';

const app = express();
const PORT = 8000;

// ==================== MIDDLEWARE =====================

// Parse JSON request bodies
app.use(express.json());

// CORS middleware
app.use(corsMiddleware);


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
        docs: "/docs",
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
app.use("/api", router);


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
    errorHandler(err, res);
});


// =================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  Meeting Room Reservation API                         ║
║  Running on http://localhost:${PORT}                     ║
║  Health check: http://localhost:${PORT}/health           ║
╚═══════════════════════════════════════════════════════╝
  `);
})