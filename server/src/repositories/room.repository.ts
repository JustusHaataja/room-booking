import { supabase } from '../lib/supabase';

// Type for room
export interface Room {
    id: number;
    name: string;
    description: string;
    capacity: number;
    price: number;
    created_at: string;
    updated_at: string;
}

// Type for creating a new room (user doesn't provide id, timestamps)
export interface CreateRoomInput {
    name: string;
    description: string;
    capacity: number;
    price: number;
}

/**
* Get all rooms
*/
export async function getAllRooms(): Promise<Room[]> {
    const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("id", { ascending: true });
    
    if (error) {
        throw new Error(`Failed to fetch rooms: ${error.message}`);
    }

    return data || [];
}

/**
* Get a single room by ID
*/
export async function getRoomById(id: number): Promise<Room | null> {
    const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", id)
        .single();

    if (error && error.code !== "PGRST116") {
        throw new Error(`Failed to fetch room: ${error.message}`);
    }
    
    return data || null;
}

/**
* Create a new room (admin only)
*/
export async function createRoom(input: CreateRoomInput): Promise<Room> {
    const { data, error } = await supabase
        .from("rooms")
        .insert({
            name: input.name,
            description: input.description || null,
            capacity: input.capacity,
            price: input.price,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create room: ${error.message}`)
    }

    return data;
}

/**
* Delete a room (admin only)
*/
export async function deleteRoom(id: number): Promise<void> {
    const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", id)

    if (error) {
        throw new Error(`Failed to delete room: ${error.message}`)
    }
}

/**
* Check if room is available for a date range
* Returns true if NO overlapping bookings exist
*/
export async function isRoomAvailable(
    roomId: number,
    startTime: string,
    endTime: string
): Promise<boolean> {
    const { data, error } = await supabase
        .from("bookings")
        .select("id")
        .eq("room_id", roomId)
        .lt("end_time", endTime)
        .gt("start_time", startTime);

    if (error) {
        throw new Error(`Failed to check availability: ${error.message}`)
    }

    // No overlapping bookings = room is available
    return (data?.length ?? 0) === 0;
}