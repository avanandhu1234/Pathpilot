"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, setAuthToken, type UserResponse, type TokenResponse } from "@/lib/api"

interface AuthState {
  user: UserResponse | null
  token: string | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USER_STORAGE_KEY = "pathpilot_user"

function loadStoredUser(): UserResponse | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserResponse
  } catch {
    return null
  }
}

function saveUser(user: UserResponse | null) {
  if (typeof window === "undefined") return
  if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_STORAGE_KEY)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always start with null/loading so server and client first paint match (avoids hydration mismatch).
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("pathpilot_token")
    if (token) setAuthToken(token)
    const user = loadStoredUser()
    setState({
      user,
      token: token || null,
      loading: false,
    })
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api.post<TokenResponse>("/api/auth/login", { email, password })
      setAuthToken(data.access_token)
      saveUser(data.user)
      setState({ user: data.user, token: data.access_token, loading: false })
    },
    []
  )

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const data = await api.post<TokenResponse>("/api/auth/register", {
        email,
        password,
        full_name: fullName || undefined,
      })
      setAuthToken(data.access_token)
      saveUser(data.user)
      setState({ user: data.user, token: data.access_token, loading: false })
    },
    []
  )

  const logout = useCallback(() => {
    setAuthToken(null)
    saveUser(null)
    setState({ user: null, token: null, loading: false })
    router.push("/")
  }, [router])

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    isAuthenticated: !!state.token && !!state.user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
