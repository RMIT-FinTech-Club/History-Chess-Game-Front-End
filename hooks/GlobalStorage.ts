import { create } from "zustand";
import Cookies from "js-cookie";

// --- Types ---
interface GlobalStorage {
  userId: string | null;
  userName: string | null;
  email: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  avatar: string | null;
  setAuthData: (data: {
    userId: string;
    userName: string;
    email: string;
    accessToken: string;
    refreshToken: string | null;
    avatar?: string | null;
  }) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

// --- Cookie Options ---
const cookieOptions = {
  expires: 7, // 7 days
  secure: process.env.PRODUCTION === "1", // HTTPS only in production
  sameSite: "strict" as const, // Prevent CSRF
  path: "/", // Accessible site-wide
};

// --- Store ---
export const useGlobalStorage = create<GlobalStorage>((set, get) => ({
  userId: Cookies.get("userId") || null,
  userName: Cookies.get("userName") || null,
  email: Cookies.get("email") || null,
  accessToken: Cookies.get("accessToken") || null,
  refreshToken: Cookies.get("refreshToken") || null,
  avatar:
    typeof window !== "undefined" ? localStorage.getItem("avatar") || null : null,

  setAuthData: ({ userId, userName, email, accessToken, refreshToken, avatar }) => {
    try {
      // Log avatar value for debugging
      console.log("Setting auth data, avatar value:", avatar);

      // Store sensitive fields in cookies
      Cookies.set("userId", userId, cookieOptions);
      Cookies.set("userName", userName, cookieOptions);
      Cookies.set("email", email, cookieOptions);
      Cookies.set("accessToken", accessToken, cookieOptions);
      if (refreshToken) {
        Cookies.set("refreshToken", refreshToken, cookieOptions);
      }
      console.log("access token: ", accessToken)
      console.log("avatar: ", avatar)

      // Store avatar in localStorage
      if (typeof window !== "undefined") {
        if (avatar !== undefined) {
          localStorage.setItem("avatar", avatar || "");
        } else {
          localStorage.removeItem("avatar");
        }
      }

      set({
        userId,
        userName,
        email,
        accessToken,
        refreshToken,
        avatar: avatar !== undefined ? avatar : null,
      });
    } catch (error) {
      console.error("Error setting auth data:", error);
      throw new Error("Failed to set authentication data");
    }
  },

  clearAuth: () => {
    Cookies.remove("userId", { path: "/" });
    Cookies.remove("userName", { path: "/" });
    Cookies.remove("email", { path: "/" });
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("refreshToken", { path: "/" });

    // Clear avatar from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("avatar");
    }

    set({
      userId: null,
      userName: null,
      email: null,
      accessToken: null,
      refreshToken: null,
      avatar: null,
    });
  },

  isAuthenticated: () => {
    const { accessToken } = get();
    return !!accessToken && accessToken.trim() !== "";
  },
}));