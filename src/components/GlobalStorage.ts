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

  setUserInfo: (userId: string, userName: string, avatar: string) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  isLoggedIn: () => boolean
}

// --- Initialize decrypted tokens from cookies ---
const encryptedAccessToken = Cookies.get('accessToken')
const encryptedRefreshToken = Cookies.get('refreshToken')

const accessTokenCookie = encryptedAccessToken ? decryptData(encryptedAccessToken) : null
const refreshTokenCookie = encryptedRefreshToken ? decryptData(encryptedRefreshToken) : null

export const useGlobalStorage = create<GlobalStorage>((set, get) => ({
  userId: null,
  userName: null,
  avatar: null,
  accessToken: accessTokenCookie,
  refreshToken: refreshTokenCookie,

  setUserInfo: (userId, userName, avatar) => {
    set({ userId, userName, avatar })
  },

  setTokens: (accessToken, refreshToken) => {
    const encryptedAccess = encryptData(accessToken)
    const encryptedRefresh = encryptData(refreshToken)

    Cookies.set('accessToken', encryptedAccess, { secure: true, sameSite: 'strict' })
    Cookies.set('refreshToken', encryptedRefresh, { secure: true, sameSite: 'strict' })

    set({ accessToken, refreshToken })
  },

  clearAuth: () => {
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
    const sessionExists = !!get().userId
    const tokenExists = !!get().accessToken
    return sessionExists || tokenExists
  }
}))
