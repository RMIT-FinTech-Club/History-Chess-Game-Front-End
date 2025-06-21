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
}

// --- Store ---
export const useGlobalStorage = create<GlobalStorage>((set) => ({
  userId: Cookies.get("userId") || null,
  userName: Cookies.get("userName") || null,
  email: Cookies.get("email") || null,
  accessToken: Cookies.get("accessToken") || null,
  refreshToken: Cookies.get("refreshToken") || null,
  avatar: Cookies.get("avatar") || null,

  setAuthData: ({ userId, userName, email, accessToken, refreshToken, avatar }) => {
    Cookies.set("userId", userId);
    Cookies.set("userName", userName);
    Cookies.set("email", email);
    Cookies.set("accessToken", accessToken);
    if (refreshToken) {
      Cookies.set("refreshToken", refreshToken);
    }
    if (avatar) {
      Cookies.set("avatar", avatar);
    }

    set({
      userId,
      userName,
      email,
      accessToken,
      refreshToken,
      avatar: avatar || null,
    });
  },

  clearAuth: () => {
    Cookies.remove("userId");
    Cookies.remove("userName");
    Cookies.remove("email");
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("avatar");

    set({
      userId: null,
      userName: null,
      email: null,
      accessToken: null,
      refreshToken: null,
      avatar: null,
    });
  },
}));