"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth"
import { useRouter } from "next/navigation"

import { auth } from "@/lib/firebase"

// Define the User type based on the schema
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "CONTRIBUTOR" | "EDITOR"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  firebaseUid?: string
  isActive: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // We store the Firebase user state to track authentication status
  const [, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Function to refresh the token periodically
  const refreshToken = async (firebaseUser: FirebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken(true);
      sessionStorage.setItem('firebaseIdToken', idToken);
      console.log('Token refreshed');
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    let tokenRefreshInterval: NodeJS.Timeout | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true)

      if (firebaseUser) {
        setFirebaseUser(firebaseUser)

        try {
          // Get the Firebase ID token
          const idToken = await firebaseUser.getIdToken(true)

          // Set up token refresh interval (refresh every 30 minutes)
          // Firebase tokens typically expire after 1 hour
          if (tokenRefreshInterval) {
            clearInterval(tokenRefreshInterval);
          }

          tokenRefreshInterval = setInterval(() => {
            refreshToken(firebaseUser);
          }, 30 * 60 * 1000); // 30 minutes

          // Store the token in sessionStorage for API requests
          // Using sessionStorage instead of localStorage for better security
          // This will be cleared when the browser is closed
          sessionStorage.setItem('firebaseIdToken', idToken)

          // Fetch user data from your API
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/admin/me`, {
              headers: {
                Authorization: `Bearer ${idToken}`
              }
            })

            if (response.ok) {
            const userData = await response.json()

            // Check if user has admin role
            if (
              userData.role !== "SUPER_ADMIN" &&
              userData.role !== "ADMIN" &&
              userData.role !== "CONTRIBUTOR"
            ) {
              // Not an admin user, sign out
              await firebaseSignOut(auth)
              setUser(null)
              localStorage.removeItem("isAuthenticated")
              setError("You don't have permission to access the admin panel")
              router.push("/login")
              return
            }

            // Check if user is active
            if (!userData.isActive) {
              // Inactive user, sign out
              await firebaseSignOut(auth)
              setUser(null)
              localStorage.removeItem("isAuthenticated")
              setError("Your account is inactive. Please contact an administrator.")
              router.push("/login")
              return
            }

            // Set the user data
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              firebaseUid: firebaseUser.uid,
              isActive: userData.isActive
            })

            // Cache the user data for offline use
            localStorage.setItem("cachedUserData", JSON.stringify(userData))
            localStorage.removeItem("usingCachedAuth")

            // Set authentication cookie
            document.cookie = `isAuthenticated=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`

            // Store authentication state
            localStorage.setItem("isAuthenticated", "true")
            } else {
              // If the API call fails, sign out from Firebase
              await firebaseSignOut(auth)
              setUser(null)
              localStorage.removeItem("isAuthenticated")
              setError("Failed to fetch user data: " + (await response.text()))
            }
          } catch (apiError) {
            console.error("API connection error:", apiError);

            // Check if we have a cached user in localStorage
            const cachedUserData = localStorage.getItem("cachedUserData");
            if (cachedUserData) {
              try {
                const userData = JSON.parse(cachedUserData);
                setUser({
                  id: userData.id,
                  name: userData.name,
                  email: userData.email,
                  role: userData.role,
                  firebaseUid: firebaseUser.uid,
                  isActive: userData.isActive
                });

                // Set a flag to indicate we're using cached data
                localStorage.setItem("usingCachedAuth", "true");

                // Show a warning to the user
                console.warn("Using cached authentication data. Some features may be limited.");
                setError("API server is unavailable. Using cached data. Some features may be limited.");
              } catch (cacheError) {
                console.error("Error parsing cached user data:", cacheError);
                await firebaseSignOut(auth);
                setUser(null);
                localStorage.removeItem("isAuthenticated");
                setError("API server is unavailable and no valid cached data found.");
              }
            } else {
              // No cached data, sign out
              await firebaseSignOut(auth);
              setUser(null);
              localStorage.removeItem("isAuthenticated");
              setError("API server is unavailable. Please try again later.");
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setError("An error occurred while fetching user data")
        }
      } else {
        // No Firebase user, clear everything
        setUser(null)
        localStorage.removeItem("isAuthenticated")
      }

      setLoading(false)
    })

    // Cleanup subscription and interval
    return () => {
      unsubscribe();
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    }
  }, [])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      // Sign in with Firebase
      await signInWithEmailAndPassword(auth, email, password)

      // The auth state listener will handle setting the user
      // Set authentication cookie immediately for better UX
      document.cookie = `isAuthenticated=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`
      router.push("/dashboard")
    } catch (error: unknown) {
      const firebaseError = error as { code?: string, message?: string };
      console.error("Sign in error:", error)

      // Handle specific Firebase auth errors
      if (firebaseError.code === "auth/user-not-found" || firebaseError.code === "auth/wrong-password") {
        setError("Invalid email or password")
      } else if (firebaseError.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later")
      } else {
        setError("Failed to sign in. Please try again")
      }

      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true)

      // Sign out from Firebase
      await firebaseSignOut(auth)

      // Clear user data
      setUser(null)
      localStorage.removeItem("isAuthenticated")

      // Clear token from sessionStorage
      sessionStorage.removeItem('firebaseIdToken')

      // Clear any token refresh intervals
      const intervals = window.setInterval(() => {}, 0);
      for (let i = 0; i < intervals; i++) {
        window.clearInterval(i);
      }

      // Remove authentication cookie
      document.cookie = "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"

      // Redirect to login page
      router.push("/login")
    } catch (error: unknown) {
      console.error("Sign out error:", error)
      setError("Failed to sign out")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
