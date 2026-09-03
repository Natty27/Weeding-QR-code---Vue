/**
 * Staff sign-in state. The backend keeps no session: whoever holds the staff
 * key is staff, and it travels as the `x-admin-key` header on every request.
 * Stored in localStorage so a phone at the door survives a reload.
 */
const STORAGE_KEY = "chinet_staff_key";

export const getStaffKey = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

export const setStaffKey = (key) => {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    /* private mode: the key just won't survive a reload */
  }
};

export const clearStaffKey = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
};

export const isStaff = () => !!getStaffKey();
