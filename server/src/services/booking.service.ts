import { Booking, BookingCreate } from '../types/booking';
import * as bookingRepository from '../repositories/booking.repository';
import { getRoomById } from '../repositories/room.repository';

/**
* Custom error class for API errors
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

/**
* Validate that a timestamp string is in ISO 8601 format with timezone
* Example: "2026-05-15T14:30:00+02:00" or "2026-05-15T14:30:00Z"
*/
function validateTimezoneFormat(timestamp: string): void {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?([+\-]\d{2}:\d{2}|Z)$/;
    
    if (!isoRegex.test(timestamp)) {
        throw new ApiError(
            400,
            `Invalid timestamp format. Must be ISO 8601 with timezone (e.g., "2026-05-15T14:30:00+02:00" or "2026-05-15T14:30:00Z")`
        );
    }
}

/**
* Validate that booking times are in 15-minute blocks
* Valid minutes: 00, 15, 30, 45
*/
function validate15minBlocks(startTime: Date, endTime: Date): void {
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

/**
* Create a new booking with full business rule validation
*
* Business Rules:
* 1. Room must exist
* 2. Timestamps must include timezone (ISO 8601)
* 3. Start time cannot be in the past
* 4. Start time must be before end time
* 5. No overlapping bookings for the same room
* 6. Bookings must be in 15-minute blocks
* 7. Minimum duration is 15 minutes
*/
export async function createBooking(bookingData: BookingCreate): Promise<Booking> {
    // Rule 2: Validate timezone format on timestamps
    validateTimezoneFormat(bookingData.start_time);
    validateTimezoneFormat(bookingData.end_time);

    const startTime = new Date(bookingData.start_time);
    const endTime = new Date(bookingData.end_time);
    const now = new Date();

    // Rule 1: Validate room exists
    const room = await getRoomById(bookingData.room_id);
    if (!room) {
        throw new ApiError(
            404,
            `Room ${bookingData.room_id} not found.`
        );
    }

    // Rule 3: Start time cannot be in the past
    if (startTime < now) {
        throw new ApiError(
            400,
            "Cannot book in the past. Start time must be in the future"
        );
    }

    // Rule 4: Start time must be before end time
    if (startTime >= endTime) {
        throw new ApiError(
            400,
            "Start time must be before end time"
        );
    }

    // Rule 6 & 7: Validate 15-minute blocks
    validate15minBlocks(startTime, endTime);

    // Rule 5: Check for overlapping bookings
    const overlapping = await bookingRepository.getOverlappingBookings(
        bookingData.room_id,
        bookingData.start_time,
        bookingData.end_time
    );

    if (overlapping.length > 0) {
        throw new ApiError(
            409,
            `Room ${bookingData.room_id} is already booked for the requested time period.`
        );
    }

    // All validations passed - create the booking
    return await bookingRepository.createBooking(bookingData);
}

/**
* Get all bookings for a specific room
* Optionally filter to only future bookings
*/
export async function getRoomBookings(
    roomId: number,
    fromNow: boolean = false
): Promise<Booking[]> {
    // Validate room exists
    const room = await getRoomById(roomId);
    if (!room) {
        throw new ApiError(
            404,
            `Room ${roomId} not found.`
        );
    }

    const fromTime = fromNow ? new Date() : undefined;
    return await bookingRepository.getBookingsByRoom(roomId, fromTime);
}

/**
* Get all bookings across all rooms
* Optionally filter to only future bookings
*/
export async function getAllBookings(fromNow: boolean = false): Promise<Booking[]> {
    let allBookings = await bookingRepository.getAllBookings();

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
export async function cancelBooking(bookingId: string): Promise<void> {
    // Check if booking exists
    const booking = await bookingRepository.getBookingById(bookingId);
    if (!booking) {
        throw new ApiError(
            404,
            `Booking ${bookingId} not found.`
        );
    }

    // Delete the booking
    await bookingRepository.deleteBooking(bookingId);
}