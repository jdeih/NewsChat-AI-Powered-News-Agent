"use client"

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Simple demo auth using localStorage
// In production, replace with Firebase Auth or similar
export class AuthService {
  private static instance: AuthService
  private listeners: ((state: AuthState) => void)[] = []
  private currentState: AuthState = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.loadUserFromStorage()
    }
  }

  private loadUserFromStorage() {
    try {
      const userData = localStorage.getItem("newsChat_user")
      if (userData) {
        const user = JSON.parse(userData)
        this.currentState = {
          user: { ...user, createdAt: new Date(user.createdAt) },
          isLoading: false,
          isAuthenticated: true,
        }
      } else {
        this.currentState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
        }
      }
    } catch (error) {
      console.error("Error loading user from storage:", error)
      this.currentState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }
    }
    this.notifyListeners()
  }

  private saveUserToStorage(user: User) {
    localStorage.setItem("newsChat_user", JSON.stringify(user))
  }

  private removeUserFromStorage() {
    localStorage.removeItem("newsChat_user")
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.currentState))
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener)
    // Immediately call with current state
    listener(this.currentState)

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  getState(): AuthState {
    return this.currentState
  }

  async signUp(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem("newsChat_users") || "[]")
      if (existingUsers.find((u: User) => u.email === email)) {
        return { success: false, error: "User already exists with this email" }
      }

      // Create new user
      const user: User = {
        id: Date.now().toString(),
        email,
        name,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        createdAt: new Date(),
      }

      // Save to users list
      existingUsers.push(user)
      localStorage.setItem("newsChat_users", JSON.stringify(existingUsers))

      // Set as current user
      this.saveUserToStorage(user)
      this.currentState = {
        user,
        isLoading: false,
        isAuthenticated: true,
      }
      this.notifyListeners()

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to create account" }
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find user
      const existingUsers = JSON.parse(localStorage.getItem("newsChat_users") || "[]")
      const user = existingUsers.find((u: User) => u.email === email)

      if (!user) {
        return { success: false, error: "No account found with this email" }
      }

      // Set as current user
      this.saveUserToStorage(user)
      this.currentState = {
        user: { ...user, createdAt: new Date(user.createdAt) },
        isLoading: false,
        isAuthenticated: true,
      }
      this.notifyListeners()

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to sign in" }
    }
  }

  async signOut(): Promise<void> {
    this.removeUserFromStorage()
    this.currentState = {
      user: null,
      isLoading: false,
      isAuthenticated: false,
    }
    this.notifyListeners()
  }

  async updateProfile(updates: Partial<Pick<User, "name" | "avatar">>): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentState.user) {
        return { success: false, error: "Not authenticated" }
      }

      const updatedUser = { ...this.currentState.user, ...updates }

      // Update in users list
      const existingUsers = JSON.parse(localStorage.getItem("newsChat_users") || "[]")
      const userIndex = existingUsers.findIndex((u: User) => u.id === updatedUser.id)
      if (userIndex !== -1) {
        existingUsers[userIndex] = updatedUser
        localStorage.setItem("newsChat_users", JSON.stringify(existingUsers))
      }

      // Update current user
      this.saveUserToStorage(updatedUser)
      this.currentState = {
        ...this.currentState,
        user: updatedUser,
      }
      this.notifyListeners()

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to update profile" }
    }
  }
}
