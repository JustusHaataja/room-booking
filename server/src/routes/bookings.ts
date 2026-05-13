import express, { Router, Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { BookingRepository } from '../repositories/booking.repository';
import { BookingCreateSchema, BookingResponseSchema } from '../types/booking';
import { ApiError } from '../services/booking.service';

const router = Router();

// Dependency injection: create repository and service
const repository = new BookingRepository();
const service = new BookingService(repository);

/**
* POST /api/bookings
* Create a new booking
*/
router.post('/bookings', (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate and parse request body
        const bookingData = BookingCreateSchema.parse(req.body);

        // Create booking via service
        const booking = service.createBooking(bookingData);

        // Validate response matches schema
        const validatedResponse = BookingResponseSchema.parse(booking);

        // Return 201 Created
        res.status(201).json(validatedResponse);
    } catch (error) {
        next(error);
    }
})

/**
* GET /api/rooms/:room_id/bookings
* Get all bookings for a specific room
* Query params: ?from_now_true (optional)
*/
router.get("/rooms/:room_id/bookings", (req: Request, res: Response, next: NextFunction) => {
    try {
        const roomId = parseInt(req.params.room_id, 10);
        const fromNow = req.query.from_now === "true";

        if (isNaN(roomId)) {
            throw new ApiError(400, "Room ID must be vlaid number");
        }

        const bookings = service.getRoomBookings(roomId, fromNow);

        // Validate each booking response
        const validatedBookings = bookings.map((booking) =>
            BookingResponseSchema.parse(booking)
        );
        
        res.status(200).json(validatedBookings)
    } catch (error) {
        next(error);
    }
})

/**
* GET /api/bookings
* Get all bookings across all rooms
* Query params: ?from_now=true (optional)
*/
router.get("/bookings", (req: Request, res: Response, next: NextFunction) => {
    try {
        const fromNow = req.query.from_now === "true";

        const bookings = service.getAllBookings(fromNow);

        // Validate each booking in response
        const validatedBookings = bookings.map((booking) =>
            BookingResponseSchema.parse(booking)
        );

        res.status(200).json(validatedBookings);
    } catch (error) {
        next(error);
    }
})

/**
* DELETE /api/bookings/:booking_id
* Cancel a booking
*/
router.delete("/bookings/:booking_id", (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookingId = req.params.booking_id;

        service.cancelBooking(bookingId);

        // Return 204 No Content (successful deletion)
        res.status(204).send()
    } catch (error) {
        next(error);
    }
})

export default router