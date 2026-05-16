import apiClient from './api';
import { type Room } from '../types/room';
import { type BookingResponse } from '../types/booking';

/**
* Get all available rooms
*/
export const getRooms = async (): Promise<Room[]> => {
    try {
        const response = await apiClient.get<Room[]>("/rooms");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch rooms:", error);
        throw error;
    }
}

/**
* Get bookings for a spesific room
* @param roomId - Room ID
* @param fromNow - If true, only get future bookings
*/
export const getRoomBookings = async (
    roomId: number,
    fromNow: boolean = false,
): Promise<BookingResponse[]> => {
    try {
        const params = fromNow ? { fromNow: "true" } : {};
        const response = await apiClient.get<BookingResponse[]>(
            `/rooms/${roomId}/bookings`,
            { params }
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch bookings for room ${roomId}:`, error);
        throw error;
    }
}