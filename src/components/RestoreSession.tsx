"use client"

import { useEffect } from "react"
import { useGlobalStorage } from "../components/GlobalStorage"
import axios from "axios"

export default function RestoreSession() {
  const { accessToken, userId, setUserInfo, clearAuth } = useGlobalStorage()

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (accessToken && !userId) {
        try {
          const response = await axios.get('http://localhost:8080/users/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          const { id, name, avatar } = response.data
          setUserInfo(id, name, avatar)
        } catch (error) {
          console.error('Failed to restore user session:', error)
          clearAuth()
        }
      }
    }

    fetchUserInfo()
  }, [accessToken, userId, setUserInfo, clearAuth])

  return null
}
