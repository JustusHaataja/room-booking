import { Router, Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/booking.service';
import { BookingCreateSchema, BookingResponseSchema } from '../types/booking';
import { ApiError } from '../services/booking.service';

const router = Router();

/**
* POST /api/bookings
* Create a new booking
*/
router.post('/bookings', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate and parse request body
        const bookingData = BookingCreateSchema.parse(req.body);

        // Create booking via service (now async)
        const booking = await bookingService.createBooking(bookingData);

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
* Query params: ?from_now=true (optional)
*/
router.get("/rooms/:room_id/bookings", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const roomId = parseInt(req.params.room_id, 10);
        const fromNow = req.query.from_now === "true";

        if (isNaN(roomId)) {
            throw new ApiError(400, "Room ID must be a valid number");
        }

        // Get bookings via service (now async)
        const bookings = await bookingService.getRoomBookings(roomId, fromNow);

        // Validate each booking response
        const validatedBookings = bookings.map((booking) =>
            BookingResponseSchema.parse(booking)
        );
        
        res.status(200).json(validatedBookings);
    } catch (error) {
        console.log(error)
        next(error);
    }
})

/**
* GET /api/bookings
* Get all bookings across all rooms
* Query params: ?from_now=true (optional)
*/
router.get("/bookings", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fromNow = req.query.from_now === "true";

        // Get bookings via service (now async)
        const bookings = await bookingService.getAllBookings(fromNow);

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
router.delete("/bookings/:booking_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookingId = req.params.booking_id;

        // Cancel booking via service (now async)
        await bookingService.cancelBooking(bookingId);

        // Return 204 No Content (successful deletion)
        res.status(204).send();
    } catch (error) {
        next(error);
    }
})

export default router