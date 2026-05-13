import { Booking, BookingCreate, VALID_ROOM_IDS } from '../types/booking';
import { BookingRepository } from '../repositories/booking.repository';

/**
* Custom error class for API errors
* Includes HTTP status code for Express to use
*/

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export class BookingService {
    constructor(private repository: BookingRepository) {}

    /**
    * Create a new booking with full business rule validation
    *
    * Business Rules:
    * 1. Room must exist (1-10)
    * 2. Start time cannot be in the past
    * 3. Start time must be before end time
    * 4. No overlapping bookings for the same room
    * 5. Bookings must be in 15-minute blocks
    * 6. Minimum duration is 15 minutes
    */
    createBooking(bookingData: BookingCreate): Booking {
        const startTime = new Date(bookingData.start_time);
        const endTime = new Date(bookingData.end_time);
        const now = new Date();

        // Rule 1: Validate room exists
        if (!this.repository.isValidRoomId(bookingData.room_id)) {
            throw new ApiError(
                404,
                `Room ${bookingData.room_id} not found. Valid rooms are 1-${Math.max(...Array.from(VALID_ROOM_IDS))}.`
            );
        }

        // Rule 2: Start time cannot be in the past
        if (startTime < now) {
            throw new ApiError(
                400,
                "Cannot book in the past. Start time must be in the future"
            );
        }

        // Rule 3: Start time must be before end time
        if (startTime >= endTime) {
            throw new ApiError(
                400,
                "Start time must be before end time"
            );
        }

        // Rule 5 & 6: Validate 15-minute blocks
        this._validate15minBlocks(startTime, endTime)

        // Rule 4: Check for overlapping bookings
        const overlapping = this.repository.getOverlapping(
            bookingData.room_id,
            startTime,
            endTime
        );

        if (overlapping.length > 0) {
            throw new ApiError(
                409,
                `Room ${bookingData.room_id} is already booked for the requested time period.`
            );
        }

        // All validations passed - create the booking
        return this.repository.create(bookingData);
    }

    /**
    * Get all bookings for a specific room
    * Optionally filter to only future bookings
    */
    getRoomBookings(roomId: number, fromNow: boolean = false): Booking[] {
        // Validate room exists
        if (!this.repository.isValidRoomId(roomId)) {
            throw new ApiError(
                404,
                `Room ${roomId} not found. Valid rooms are 1-${Math.max(...Array.from(VALID_ROOM_IDS))}.`
            );
        }

        const fromTime = fromNow ? new Date() : undefined;
        return this.repository.getByRoom(roomId, fromTime);
    }

    /**
    * Get all bookings across all rooms
    * Optionally filter to only future bookings
    */
    getAllBookings(fromNow: boolean = false): Booking[] {
        let allBookings = this.repository.getAll();

        if (fromNow) {
            const now = new Date();
            allBookings = allBookings.filter(
                (booking) => new Date(booking.start_time) > now
            );
        }

        return allBookings;
    }

    /**
    * Cancel a booking
    * @throws ApiError if booking not found
    */
    cancelBooking(bookingId: string): void {
        // Check id booking exists
        const booking = this.repository.getByID(bookingId);
        if (!booking) {
            throw new ApiError(
                404,
                `Booking ${bookingId} not found.`
            );
        }

        // Delete the booking
        this.repository.delete(bookingId)
    }

    /**
    * Validate taht booking times are in 15-minute blocks
    * Valid minutes: 00, 15, 30, 45
    * @throws ApiError if validation fails
    */
    private _validate15minBlocks(startTime: Date, endTime: Date): void {
        const validMinutes = new Set([0, 15, 30, 45]);

        // Check start time minutes
        if (!validMinutes.has(startTime.getUTCMinutes())) {
            throw new ApiError(
                400,
                `Start time must be in 15-minute blocks (00, 15, 30 or 45 minutes). Got ${startTime.getUTCMinutes()} minutes.`
            );
        }

        // Check end time minutes
        if (!validMinutes.has(endTime.getUTCMinutes())) {
            throw new ApiError(
                400,
                `End time must be in 15-minute blocks (00, 15, 30 or 45 minutes). Got ${endTime.getUTCMinutes()} minutes.`
            );
        }

        // Check minimum duration (15 minutes)
        const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        if (durationMinutes < 15) {
            throw new ApiError(
                400,
                "Booking duration must be at least 15 minutes."
            );
        }
    }
}