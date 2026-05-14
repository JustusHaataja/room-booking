import { Router, Request, Response, NextFunction } from 'express';
import * as roomRepository from '../repositories/room.repository';
import { ApiError } from '../services/booking.service';

const router = Router();

/**
* Middleware: Check admin API key
* All room admin endpoints require the X-Admin-Key header
*/
function requireAdminKey(req: Request, _res: Response, next: NextFunction): void {
    const providedKey = req.headers["x-admin-key"] as string;
    const correctKey = process.env.ADMIN_API_KEY;

    if (!providedKey || providedKey !== correctKey) {
        throw new ApiError(
            401,
            "Unauthorized. Missing or invalid X-Admin-Key header. Contact your administrator."
        );
    }
    next();
}

/**
* GET /api/rooms
* List all rooms (public - no auth required)
*/
router.get("/rooms", async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const rooms = await roomRepository.getAllRooms();
        res.status(200).json(rooms);
    } catch (error) {
        next(error);
    }
})

/**
* GET /api/rooms/:room_id
* Get a single room by ID (public - no auth required)
*/
router.get("/rooms/:room_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const roomId = parseInt(req.params.room_id, 10);
        if (isNaN(roomId)) {
            throw new ApiError(400, "Room ID must be a valid number");
        }

        const room = await roomRepository.getRoomById(roomId);

        if (!room) {
            throw new ApiError(404, `Room ${roomId} not found`);
        }

        res.status(200).json(room);
    } catch (error) {
        next(error);
    }
})

/**
* POST /api/rooms
* Create a new room (admin only)
* Requires X-Admin-Key header
*/
router.post("/rooms", requireAdminKey, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, capacity, price } = req.body;

        // Validate required fields
        if (!name || typeof name !== "string" || name.trim() === "") {
            throw new ApiError(400, "Room is required and must be a non-empty string");
        }

        if (typeof capacity !== "number" || capacity < 1) {
            throw new ApiError(400, "Capacity must be a number >= 1");
        }

        if (typeof price !== "number" || price < 0) {
            throw new ApiError(400, "Price must be a number >= 0");
        }

        // Create the room
        const newRoom = await roomRepository.createRoom({
            name: name.trim(),
            description: description || undefined,
            capacity,
            price,
        });

        res.status(200).json(newRoom);
    } catch (error) {
        next(error);
    }
})

/**
* DELETE /api/rooms/:room_id
* Delete a room (admin only)
* Requires X-Admin-Key header
*/
router.delete("/rooms/:room_id", requireAdminKey, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const roomId = parseInt(req.params.room_id, 10);

        if (isNaN(roomId)) {
            throw new ApiError(400, "Room ID must be a valid number");
        }

        // Check if room exists before deleting
        const room = await roomRepository.getRoomById(roomId);
        if (!room) {
            throw new ApiError(404, `Room ${roomId} not found`);
        }

        // Delete the room
        await roomRepository.deleteRoom(roomId);

        // Return 204 No Content
        res.status(204).send();
    } catch (error) {
        next(error);
    }
})

export default router