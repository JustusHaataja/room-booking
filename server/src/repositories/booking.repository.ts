import { supabase } from '../lib/supabase';
import { Booking, BookingCreate } from '../types/booking';
import { getRoomById } from './room.repository';

/**
* Helper function to ensure ISO strings have timezone designator
* Supabase returns dates without timezone, but Zod validator requires it
* Also normalizes fractional seconds to 3 digits for consistent validation
*/
function ensureTimezone(dateStr: string): string {
    if (!dateStr) return dateStr;
    
    // If it already has a timezone designator, return as-is
    if (/[Zz]$/.test(dateStr) || /[+-]\d{2}:\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    
    // Normalize fractional seconds: truncate to 3 digits (milliseconds)
    // Supabase might return 6 digits (microseconds), but Zod expects 0-3
    const withoutTz = dateStr.replace(/(\.\d{4,})/, (match) => {
        // Keep only first 4 chars (dot + 3 digits)
        return match.substring(0, 4);
    });
    
    // Append Z for UTC (Supabase stores in UTC by default)
    return withoutTz + 'Z';
}

/**
* Transform booking data to include timezone info on all date fields
*/
function formatBooking(booking: any): Booking {
    if (!booking) return booking;
    return {
        ...booking,
        start_time: ensureTimezone(booking.start_time),
        end_time: ensureTimezone(booking.end_time),
        created_at: ensureTimezone(booking.created_at),
    };
}

/**
* Create a new booking
*/
export async function createBooking(bookingData: BookingCreate): Promise<Booking> {
    const { data, error } = await supabase
        .from('bookings')
        .insert({
            room_id: bookingData.room_id,
            user_name: bookingData.user_name,
            start_time: bookingData.start_time,
            end_time: bookingData.end_time,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create booking: ${error.message}`);
    }

    return formatBooking(data);
}

/**
* Get a booking by ID
*/
export async function getBookingById(bookingId: string): Promise<Booking | null> {
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw new Error(`Failed to fetch booking: ${error.message}`);
    }

    return data ? formatBooking(data) : null;
}

/**
* Get all bookings for a specific room, optionally filtered by time
*/
export async function getBookingsByRoom(
    roomId: number,
    fromTime?: Date
): Promise<Booking[]> {
    let query = supabase
        .from('bookings')
        .select('*')
        .eq('room_id', roomId);

    if (fromTime) {
        const fromTimeISO = fromTime.toISOString();
        query = query.gte('end_time', fromTimeISO);
    }

    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch bookings for room: ${error.message}`);
    }

    return (data || []).map(formatBooking);
}

/**
* Find bookings that overlap with the given time range for a specific room
* Two bookings overlap if start1 < end2 AND start2 < end1
*/
export async function getOverlappingBookings(
    roomId: number,
    startTime: string,  // ISO 8601 with timezone
    endTime: string,    // ISO 8601 with timezone
    excludeBookingId?: string
): Promise<Booking[]> {
    let query = supabase
        .from('bookings')
        .select('*')
        .eq('room_id', roomId)
        .lt('end_time', endTime)      // end_time is before our end
        .gt('start_time', startTime); // start_time is after our start

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch overlapping bookings: ${error.message}`);
    }

    // Filter out excluded booking if provided
    const bookings = (data || []).map(formatBooking);
    if (excludeBookingId) {
        return bookings.filter(b => b.id !== excludeBookingId);
    }

    return bookings;
}

/**
* Delete a booking by ID
* @returns true if deleted, false if not found
*/
export async function deleteBooking(bookingId: string): Promise<boolean> {
    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

    if (error) {
        throw new Error(`Failed to delete booking: ${error.message}`);
    }

    return true;
}

/**
* Check if a room ID is valid (room exists in database)
*/
export async function isValidRoomId(roomId: number): Promise<boolean> {
    const room = await getRoomById(roomId);
    return room !== null;
}

/**
* Get all bookings
*/
export async function getAllBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('start_time', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch all bookings: ${error.message}`);
    }

    return (data || []).map(formatBooking);
}