// apiConfig.ts
import axios, { AxiosError } from "axios";
import basePath from "./pathConfig";
import { useGlobalStorage } from "@/hooks/GlobalStorage";
import { toast } from "sonner";

// Module augmentation for InternalAxiosRequestConfig
declare module "axios" {
    interface InternalAxiosRequestConfig<D = any> {
        _retry?: boolean;
    }
}

// Create Axios instance with direct backend URL
const axiosInstance = axios.create({
    baseURL: basePath,
    headers: {
        "Content-Type": "application/json",
    },
});

// Response interceptor for handling 401 errors
axiosInstance.interceptors.response.use(
    (response) => response, // Pass through successful responses
    (error: AxiosError) => {
        const originalRequest = error.config;

        // Check if error is 401
        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            // Mark request as handled to prevent loops
            originalRequest._retry = true;
            toast.error("Access token expired please login again!")

            // Clear auth data using Zustand store
            useGlobalStorage.getState().clearAuth();

            // Redirect to sign-in page
            if (typeof window !== "undefined") {
                window.location.href = "/sign_in"; // Use window.location.href instead of router.push
            }

            // Reject the error to prevent retrying the request
            return Promise.reject(error);
        }

        // Pass through other errors
        return Promise.reject(error);
    }
);

export default axiosInstance;