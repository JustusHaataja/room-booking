import { z } from 'zod';

// Validation schema for creating a booking (request body)
export const BookingCreateSchema = z.object({
    room_id: z.number().int().min(1).max(10).describe("Room ID (1-10)"),
    start_time: z.string().datetime({ offset: true }).describe("Start time in ISO 8601 format with timezone"),
    end_time: z.string().datetime({ offset: true }).describe("End time in ISO 8601 format with timezone"),
    user_name: z
        .string()
        .min(1, "user_name is required and cannot be empty")
        .max(50, "user_name exceeds maximum length of 50 characters")
        .regex(/^[a-zA-Z0-9@._\-+ ]+$/, 'user_name contains invalid characters')
        .describe("Name of the person making the booking"),
})

// Response schema for a booking (what the API returns)
export const BookingResponseSchema = z.object({
    id: z.string().uuid().describe("Unique booking ID"),
    room_id: z.number().int(),
    start_time: z.string().datetime({ offset: true }),
    end_time: z.string().datetime({ offset: true }),
    user_name: z.string(),
    created_at: z.string().datetime({ offset: true }).describe("When the booking was created"),
})

// Infer TypeScript types from schemas (automatically generated)
export type BookingCreate = z.infer<typeof BookingCreateSchema>;
export type BookingResponse = z.infer<typeof BookingResponseSchema>;

// Infer does this automatically
// export type BookingCreate = {
//     room_id: number;
//     start_time: string;
//     end_time: string;
//     user_name: string;
// }

// Internal booking type (for database operations)
export interface Booking extends BookingCreate {
    id: string;
    created_at: string;
}

export const VALID_ROOM_IDS = new Set([1,2,3,4,5,6,7,8,9,10])