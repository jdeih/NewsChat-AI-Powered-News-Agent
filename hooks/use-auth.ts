"use client"

import { useState, useEffect } from "react"
import { AuthService, type AuthState, type User } from "@/lib/auth"

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const authService = AuthService.getInstance()
    const unsubscribe = authService.subscribe(setAuthState)
    return unsubscribe
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    const authService = AuthService.getInstance()
    return authService.signUp(email, password, name)
  }

  const signIn = async (email: string, password: string) => {
    const authService = AuthService.getInstance()
    return authService.signIn(email, password)
  }

  const signOut = async () => {
    const authService = AuthService.getInstance()
    return authService.signOut()
  }

  const updateProfile = async (updates: Partial<Pick<User, "name" | "avatar">>) => {
    const authService = AuthService.getInstance()
    return authService.updateProfile(updates)
  }

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }
}
