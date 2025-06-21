import { create } from "zustand";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

// --- Config ---
const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || "your-secret-key";

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

// --- Store ---
export const useGlobalStorage = create<GlobalStorage>((set, get) => ({
  userId: Cookies.get("userId")
    ? CryptoJS.AES.decrypt(Cookies.get("userId")!, SECRET_KEY).toString(CryptoJS.enc.Utf8)
    : null,
  userName: Cookies.get("userName")
    ? CryptoJS.AES.decrypt(Cookies.get("userName")!, SECRET_KEY).toString(CryptoJS.enc.Utf8)
    : null,
  email: Cookies.get("email")
    ? CryptoJS.AES.decrypt(Cookies.get("email")!, SECRET_KEY).toString(CryptoJS.enc.Utf8)
    : null,
  accessToken: Cookies.get("accessToken")
    ? CryptoJS.AES.decrypt(Cookies.get("accessToken")!, SECRET_KEY).toString(CryptoJS.enc.Utf8)
    : null,
  refreshToken: Cookies.get("refreshToken")
    ? CryptoJS.AES.decrypt(Cookies.get("refreshToken")!, SECRET_KEY).toString(CryptoJS.enc.Utf8)
    : null,
  avatar: Cookies.get("avatar")
    ? CryptoJS.AES.decrypt(Cookies.get("avatar")!, SECRET_KEY).toString(CryptoJS.enc.Utf8)
    : null,

  setAuthData: ({ userId, userName, email, accessToken, refreshToken, avatar }) => {
    Cookies.set("userId", CryptoJS.AES.encrypt(userId, SECRET_KEY).toString());
    Cookies.set("userName", CryptoJS.AES.encrypt(userName, SECRET_KEY).toString());
    Cookies.set("email", CryptoJS.AES.encrypt(email, SECRET_KEY).toString());
    Cookies.set("accessToken", CryptoJS.AES.encrypt(accessToken, SECRET_KEY).toString());
    if (refreshToken) {
      Cookies.set("refreshToken", CryptoJS.AES.encrypt(refreshToken, SECRET_KEY).toString());
    }
    if (avatar) {
      Cookies.set("avatar", CryptoJS.AES.encrypt(avatar, SECRET_KEY).toString());
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

  isAuthenticated: () => {
    const { accessToken } = get();
    return !!accessToken && accessToken.trim() !== "";
  },
}));