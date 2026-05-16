import apiClient from './api';
import { type BookingCreate, type BookingResponse } from '../types/booking';

/**
* Get all bookings
* @param fromNow - If true, only get future bookings
*/
export const getAllBookings = async (
    fromNow: boolean = false
): Promise<BookingResponse[]> => {
    try {
        const params = fromNow ? { fromNow: "true" } : {};
        const response = await apiClient.get<BookingResponse[]>("/bookings", {
            params,
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch bookings:", error);
        throw error;
    }
}

/**
* Create a new booking
* @param bookingData - Booking details (room_id, start_time, end_time, user_name)
*/
export const createBooking = async (
    bookingData: BookingCreate
): Promise<BookingResponse> => {
    try {
        const response = await apiClient.post<BookingResponse>(
            "/bookings",
            bookingData
        );
        return response.data;
    } catch (error) {
        console.error("Failed to create booking:", error);
        throw error;
    }
}

/**
* Cancel a booking
* @param bookingId - Booking ID to cancel
*/
export const cancelBooking = async (bookingId: string): Promise<void> => {
    try {
        await apiClient.delete(`/bookings/${bookingId}`);
    } catch (error) {
        console.error(`Failed to cancel booking ${bookingId}:`, error);
        throw error;
    }
}