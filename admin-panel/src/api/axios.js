import axios from "axios";

// Base URL is configurable via .env — never hardcode it inside components/services.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/knowledge";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30s — PDF embedding can take a while server-side
});

/**
 * Normalizes every error thrown by axios into one shape our UI can rely on:
 * { message, status, isNetworkError }
 * The backend always responds with { success:false, message:"..." } on failure,
 * so we surface that exact message instead of a generic one.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const backendMessage = error.response.data?.message;
      const status = error.response.status;

      let message = backendMessage;
      if (!message) {
        if (status === 401) message = "You are not authorized to perform this action.";
        else if (status === 403) message = "Access denied.";
        else if (status === 404) message = "The requested resource was not found.";
        else if (status >= 500) message = "Something went wrong on the server. Please try again.";
        else message = "The request could not be completed.";
      }

      return Promise.reject({
        message,
        status,
        isNetworkError: false,
        raw: error,
      });
    }

    if (error.request) {
      return Promise.reject({
        message: "Cannot reach the server. Check your connection or that the backend is running.",
        status: null,
        isNetworkError: true,
        raw: error,
      });
    }

    return Promise.reject({
      message: error.message || "An unexpected error occurred.",
      status: null,
      isNetworkError: false,
      raw: error,
    });
  }
);

export default api;
