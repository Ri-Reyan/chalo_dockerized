import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";

/**
 * Base URL configuration for Chalo Backend API.
 * Defaults to http://localhost:5000/api when NEXT_PUBLIC_API_URL is unset.
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Standardized backend API response envelope shape.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: unknown;
}

/**
 * Configured Axios instance for the Chalo application.
 * withCredentials: true ensures HTTP-only cookies (accessToken, refreshToken)
 * are seamlessly transmitted with all cross-origin or same-origin requests.
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Request interceptor for logging or dynamic header injection.
 * Injects Authorization header from localStorage if available, ensuring
 * seamless authentication even if cross-site cookies are blocked or stripped.
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("chalo_token");
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor for extracting descriptive error messages
 * returned by the Chalo backend errorHandler.
 */
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // Extract server-provided message if available
    const serverMessage = error.response?.data?.message;
    if (serverMessage && typeof serverMessage === "string") {
      error.message = serverMessage;
    } else if (error.code === "ECONNABORTED") {
      error.message =
        "Request timed out. Please check your internet connection.";
    } else if (!error.response) {
      error.message =
        "Unable to connect to Chalo backend server. Please ensure the server is running.";
    }

    return Promise.reject(error);
  },
);

/**
 * Utility helper to extract a clean string error message from unknown errors.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      "An unexpected server error occurred."
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
}

export default api;
