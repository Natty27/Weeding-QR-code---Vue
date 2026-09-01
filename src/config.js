// Single source of truth for host/port. Values come from frontend/.env
const FALLBACK_HOST = import.meta.env.VITE_FALLBACK_HOST || "192.168.0.108";
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || "47311";
const FRONTEND_PORT = import.meta.env.VITE_FRONTEND_PORT || "47312";

export const hostname =
  typeof window !== "undefined" && window.location.hostname
    ? window.location.hostname
    : FALLBACK_HOST;

export const BACKEND_BASE_URL = `http://${hostname}:${BACKEND_PORT}`;
export const FRONTEND_BASE_URL = `http://${hostname}:${FRONTEND_PORT}`;
