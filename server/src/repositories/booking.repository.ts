import { supabase } from '../lib/supabase';
import { Booking, BookingCreate } from '../types/booking';
import { getRoomById } from './room.repository';

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

    return data;
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

    return data || null;
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

    return data || [];
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
    const bookings = data || [];
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

    return data || [];
}