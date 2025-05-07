"use client"

import { create } from "zustand"
import Cookies from "js-cookie"
import CryptoJS from "crypto-js"

// --- Config ---
const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPT_SECRET || "your-default-key"

function encryptData(data: string) {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString()
}

function decryptData(encryptedData: string) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

// --- Zustand Store ---
interface GlobalStorage {
  userId: string | null
  userName: string | null
  avatar: string | null
  accessToken: string | null
  refreshToken: string | null

  setAuthData: (
    userId: string,
    userName: string,
    avatar: string,
    accessToken: string,
    refreshToken: string
  ) => void

  clearAuth: () => void
  isLoggedIn: () => boolean
}

// --- Initialize decrypted values if window exists ---
let userIdCookie: string | null = null
let accessTokenCookie: string | null = null
let refreshTokenCookie: string | null = null

if (typeof window !== "undefined") {
  const encryptedUserId = Cookies.get('userId')
  const encryptedAccessToken = Cookies.get('accessToken')
  const encryptedRefreshToken = Cookies.get('refreshToken')

  userIdCookie = encryptedUserId ? decryptData(encryptedUserId) : null
  accessTokenCookie = encryptedAccessToken ? decryptData(encryptedAccessToken) : null
  refreshTokenCookie = encryptedRefreshToken ? decryptData(encryptedRefreshToken) : null
}

export const useGlobalStorage = create<GlobalStorage>((set, get) => ({
  userId: userIdCookie,
  userName: null,
  avatar: null,
  accessToken: accessTokenCookie,
  refreshToken: refreshTokenCookie,

  setAuthData: (userId, userName, avatar, accessToken, refreshToken) => {
    const encryptedUserId = encryptData(userId)
    const encryptedAccess = encryptData(accessToken)
    const encryptedRefresh = encryptData(refreshToken)

    Cookies.set('userId', encryptedUserId, { secure: true, sameSite: 'strict' })
    Cookies.set('accessToken', encryptedAccess, { secure: true, sameSite: 'strict' })
    Cookies.set('refreshToken', encryptedRefresh, { secure: true, sameSite: 'strict' })

    set({ userId, userName, avatar, accessToken, refreshToken })
  },

  clearAuth: () => {
    Cookies.remove('userId')
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')

    set({
      userId: null,
      userName: null,
      avatar: null,
      accessToken: null,
      refreshToken: null,
    })
  },

  isLoggedIn: () => {
    const userExists = !!get().userId
    const tokenExists = !!get().accessToken
    return userExists && tokenExists
  }
}))