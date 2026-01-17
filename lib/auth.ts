import { supabase } from "./supabase/client"
import { isValidPasskey } from "./passkeys"
import type { User } from "@supabase/supabase-js"

export type UserRole = "seller" | "buyer"

export interface SignupData {
  email: string
  password: string
  name: string
  userType: UserRole
  passkey?: string
}

export interface LoginData {
  email: string
  password: string
  userType: UserRole
  passkey?: string
}

export interface AuthResponse {
  user: User | null
  error: string | null
}

export async function signUp(data: SignupData): Promise<AuthResponse> {
  try {
    if (data.userType === "buyer") {
      if (!data.passkey) {
        return { user: null, error: "Passkey is required for buyers" }
      }
      if (!isValidPasskey(data.passkey)) {
        return { user: null, error: "Invalid passkey. Please contact support for a valid buyer passkey." }
      }
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          user_type: data.userType,
          passkey: data.userType === "buyer" ? data.passkey : null,
        },
      },
    })

    if (authError) {
      return { user: null, error: authError.message }
    }

    if (!authData.user) {
      return { user: null, error: "Failed to create user" }
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", authData.user.id)
      .single()

    if (!existingProfile) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        user_type: data.userType,
        passkey: data.userType === "buyer" ? data.passkey : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        const errorMessage = profileError.message || "Failed to create user profile"
        
        if (errorMessage.includes("duplicate key") || errorMessage.includes("already exists")) {
          return { user: null, error: "An account with this email already exists. Please try logging in instead." }
        }
        if (errorMessage.includes("violates row-level security") || errorMessage.includes("RLS")) {
          return { 
            user: null, 
            error: "Database security policy error. Please ensure the profiles table and RLS policies are set up correctly. Check SUPABASE_SETUP.md for instructions." 
          }
        }
        if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
          return { 
            user: null, 
            error: "Database table not found. Please run the SQL script in SUPABASE_SETUP.md to create the profiles table." 
          }
        }
        
        return { 
          user: null, 
          error: `Failed to create user profile: ${errorMessage}. Please check your Supabase setup.` 
        }
      }
    }

    return { user: authData.user, error: null }
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function signIn(data: LoginData): Promise<AuthResponse> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      return { user: null, error: authError.message }
    }

    if (!authData.user) {
      return { user: null, error: "Invalid credentials" }
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type, passkey")
      .eq("id", authData.user.id)
      .single()

    if (profileError) {
      return { user: null, error: "Failed to fetch user profile" }
    }

    if (profile.user_type !== data.userType) {
      await supabase.auth.signOut()
      return {
        user: null,
        error: `Invalid user type. This account is registered as a ${profile.user_type}, not a ${data.userType}.`,
      }
    }

    if (data.userType === "buyer") {
      if (!data.passkey) {
        await supabase.auth.signOut()
        return { user: null, error: "Passkey is required for buyers" }
      }
      if (profile.passkey !== data.passkey) {
        await supabase.auth.signOut()
        return { user: null, error: "Invalid passkey" }
      }
    }

    return { user: authData.user, error: null }
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut()
    return { error: error?.message || null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
    if (error) {
      return { profile: null, error: error.message }
    }
    return { profile: data, error: null }
  } catch (error) {
    return {
      profile: null,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
