export interface BookingCreate {
    room_id: number;
    start_time: string;
    end_time: string;
    user_name: string;
}

export interface Booking extends BookingCreate {
    id: string;
    created_at: string;
}

export interface BookingResponse {
    id: number;
    room_id: number;
    start_time: string;
    end_time: string;
    user_name: string;
    created_at: string;
}