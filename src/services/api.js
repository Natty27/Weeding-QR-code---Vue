import axios from "axios";
import { BACKEND_BASE_URL } from "../config";
import { clearStaffKey, getStaffKey } from "./auth";

const api = axios.create({
  baseURL: BACKEND_BASE_URL,
});

/** Attach the staff key when we have one; guest routes simply ignore it */
api.interceptors.request.use((config) => {
  const key = getStaffKey();

  if (key) {
    config.headers["x-admin-key"] = key;
  }

  return config;
});

/** A rejected key is a dead key: drop it so the app asks for it again */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStaffKey();
    }

    return Promise.reject(error);
  },
);

export default api;
