import axios, { type AxiosInstance, AxiosError } from 'axios';
import { type ApiError } from '../types/common';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    console.error("VITE_API_URL environment variable is not set");
}

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    }
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Transform axios error into ApiError format
        const apiError: ApiError = {
            message: error.message || "An error occured",
            status: error.response?.status,
            details: error.response?.data,
        }

        return Promise.reject(apiError);
    }
)

export default apiClient