import type { User } from "@/src/types/user";

const userStorageKey = "user";

export function getCurrentUser(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem(userStorageKey);
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
}

export function setCurrentUser(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem(userStorageKey, JSON.stringify(user));
  }
}
