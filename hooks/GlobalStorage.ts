import { create } from "zustand";
import Cookies from "js-cookie";

// --- Types ---
interface PendingSignup {
  username: string;
  email: string;
  password: string;
}

interface GlobalStorage {
  userId: string | null;
  userName: string | null;
  email: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  avatar: string | null;
  pendingSignup: PendingSignup | null;
  setAuthData: (data: {
    userId: string;
    userName: string;
    email: string;
    accessToken: string;
    refreshToken: string | null;
    role?: string | null;
    avatar?: string | null;
  }) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  setPendingSignup: (data: PendingSignup) => void;
  clearPendingSignup: () => void;
  getPendingSignup: () => PendingSignup | null;
  walletBalance: string;
  setWalletBalance: (balance: string) => void;
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
  role: Cookies.get("role") || null,
  avatar:
    typeof window !== "undefined" ? localStorage.getItem("avatar") || null : null,
  pendingSignup:
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("pendingSignup") || "null")
      : null,

  setAuthData: ({ userId, userName, email, accessToken, refreshToken, role, avatar }) => {
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
      if (role) {
        Cookies.set("role", role, cookieOptions);
      }
      console.log("access token: ", accessToken)
      console.log("avatar: ", avatar)
      console.log("role: ", role)

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
        role: role !== undefined ? role : get().role,
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
    Cookies.remove("role", { path: "/" });

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
      role: null,
      avatar: null,
    });
  },

  isAuthenticated: () => {
    const { accessToken } = get();
    return !!accessToken && accessToken.trim() !== "";
  },

  setPendingSignup: (data: PendingSignup) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pendingSignup", JSON.stringify(data));
    }
    set({ pendingSignup: data });
  },

  clearPendingSignup: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pendingSignup");
    }
    set({ pendingSignup: null });
  },

  getPendingSignup: () => {
    return get().pendingSignup;
  },

  walletBalance: "0",
  setWalletBalance: (balance: string) => set({ walletBalance: balance }),
}));