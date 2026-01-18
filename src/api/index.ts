// Export all API modules
export * from "./authApi";
export * from "./userApi";
export * from "./eventApi";
export * from "./connectionApi";
export * from "./postApi";
export * from "./bookingApi";
export * from "./wishlistApi";

// Export the base API client
export { apiClient, getCurrentBaseURL } from "../services/api";