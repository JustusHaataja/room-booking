export interface ApiResponse<T> {
    data: T;
    status: number
}

export interface ApiError {
    message: string;
    status?: number;
    details?: unknown;
}