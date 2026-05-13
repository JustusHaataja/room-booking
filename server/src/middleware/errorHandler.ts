import { Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../services/booking.service';

/**
* Error response structure
*/
interface ErrorResponse {
    error: string;
    details?: string | object;
    status: number;
}

/**
* Global error handling middleware
* Must be registered LAST in Express app
*/
export const errorHandler = (
    err: Error | ZodError | ApiError,
    res: Response,
    // req: Request,
    // next: NextFunction,
) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let details: string | object | undefined;

    // Handle Zod validation errors (from .parse())
    if (err instanceof ZodError) {
        statusCode = 400;
        message = "Validation Error";
        // Format Zod errors
        details = err.errors.map((error) => ({
            field: error.path.join("."),
            message: error.message,
            code: error.code,
        }));
    }
    // Handle custom ApiError
    else if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Handle generic errors
    else if (err instanceof Error) {
        message = err.message;
    }

    // Build error response
    const errorResponse: ErrorResponse = {
        error: message,
        status: statusCode,
    }

    if (details) {
        errorResponse.details = details;
    }

    // Log error
    console.error(`[${new Date().toISOString()}] Error:`, {
        statusCode,
        message,
        details,
    });

    // Send response
    res.status(statusCode).json(errorResponse);
}