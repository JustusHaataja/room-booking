import { v4 as uuidv4 } from 'uuid';
import { Booking, BookingCreate, VALID_ROOM_IDS } from '../types/booking';

export class BookingRepository {
    private bookings: Map<string, Booking> = new Map();

    /**
    * Create a new booking
    * @param bookingData - The booking data from the request
    * @returns The created booking with ID and created_at timestamp
    */
    create(bookingData: BookingCreate): Booking {
        const bookingId = uuidv4();
        const now = new Date().toISOString();

        const booking: Booking = {
            id: bookingId,
            ...bookingData,
            created_at: now,
        }

        this.bookings.set(bookingId, booking);
        return booking;
    }

    /**
    * Get a booking ID
    */
    getByID(bookingId: string): Booking | undefined {
        return this.bookings.get(bookingId);
    }

    /**
    * Get all bookings for a specific room, optionally filtered by time 
    */
    getByRoom(roomId: number, fromTime?: Date): Booking[] {
        const bookings = Array.from(this.bookings.values()).filter(
            (booking) => booking.room_id === roomId
        )

        if (fromTime) {
            return bookings.filter(
                (booking) => new Date(booking.end_time) >= fromTime
            );
        }

        return bookings.sort(
            (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
    }

    /**
    * Find bookings that overlap with the given time range for a specific room
    * Two bookings overlap if start1 < end2 AND start2 < end1 
    */
    getOverlapping(
        roomId: number,
        startTime: Date,
        endTime: Date,
        excludeBookingId?: string
    ): Booking[] {
        return Array.from(this.bookings.values()).filter((booking) => {
            if (booking.room_id !== roomId) return false;
            if (excludeBookingId && booking.id === excludeBookingId) return false;

            const bookingStart = new Date(booking.start_time);
            const bookingEnd = new Date(booking.end_time);

            // Overlap check: start1 < end2 AND start2 < end1
            return bookingStart < endTime && startTime < bookingEnd;
        });
    }

    /**
    * Delete booking by ID
    * @returns true if deleted, false if not found
    */
    delete(bookingId: string): boolean {
        return this.bookings.delete(bookingId);
    }

    /**
    * Check if a room ID is valid 
    */
    isValidRoomId(roomId: number): boolean {
        return VALID_ROOM_IDS.has(roomId);
    }

    /**
    * Get all bookings
    */
    getAll(): Booking[] {
        return Array.from(this.bookings.values()).sort(
            (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        )
    }
}