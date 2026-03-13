'use client'

import { useState, useEffect, useCallback } from 'react'
import { safeStorage, PIN_KEY, SESSION_KEY } from '@/lib/storage'

const AUTO_LOCK_TIME = 5 * 60 * 1000 // 5 minutes in milliseconds
const SESSION_CHECK_INTERVAL = 30 * 1000 // Check every 30 seconds

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSetup, setIsSetup] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())

  // Load auth state on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Auto-lock mechanism
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity

      if (timeSinceLastActivity > AUTO_LOCK_TIME) {
        logout()
      }
    }, SESSION_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [isAuthenticated, lastActivity])

  // Update last activity on user interaction
  useEffect(() => {
    if (!isAuthenticated) return

    const updateActivity = () => {
      setLastActivity(Date.now())
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      window.addEventListener(event, updateActivity)
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity)
      })
    }
  }, [isAuthenticated])

  const checkAuthStatus = useCallback(async () => {
    setLoading(true)
    
    try {
      const storedPin = safeStorage.getItem(PIN_KEY)
      const session = safeStorage.getItem(SESSION_KEY)

      if (!storedPin) {
        setIsSetup(false)
        setIsAuthenticated(false)
        setLoading(false)
        return
      }

      setIsSetup(true)

      // Check if session is valid (within 5 minutes)
      if (session) {
        const sessionTime = parseInt(session)
        const now = Date.now()
        if (now - sessionTime < AUTO_LOCK_TIME) {
          setIsAuthenticated(true)
          setLastActivity(sessionTime)
        } else {
          safeStorage.removeItem(SESSION_KEY)
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback((pin: string) => {
    safeStorage.setItem(SESSION_KEY, Date.now().toString())
    setLastActivity(Date.now())
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      safeStorage.removeItem(SESSION_KEY)
      setIsAuthenticated(false)
      setLastActivity(Date.now())
    }
  }, [])

  const setupPin = useCallback((pin: string) => {
    safeStorage.setItem(PIN_KEY, pin)
    safeStorage.setItem(SESSION_KEY, Date.now().toString())
    setIsSetup(true)
    setIsAuthenticated(true)
    setLastActivity(Date.now())
  }, [])

  const changePin = useCallback((newPin: string) => {
    safeStorage.setItem(PIN_KEY, newPin)
    safeStorage.setItem(SESSION_KEY, Date.now().toString())
    setLastActivity(Date.now())
  }, [])

  const resetPin = useCallback(() => {
    safeStorage.removeItem(PIN_KEY)
    safeStorage.removeItem(SESSION_KEY)
    setIsSetup(false)
    setIsAuthenticated(false)
    setLastActivity(Date.now())
  }, [])

  return {
    isAuthenticated,
    isSetup,
    loading,
    login,
    logout,
    setupPin,
    changePin,
    resetPin,
    checkAuthStatus,
    getStoredPin: () => safeStorage.getItem(PIN_KEY) || '',
    updateActivity: () => setLastActivity(Date.now())
  }
}
