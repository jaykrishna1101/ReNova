"use client"

import { useState } from "react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue your journey"
      isPasswordFocused={isPasswordFocused}
    >
      <LoginForm onPasswordFocusChange={setIsPasswordFocused} />
    </AuthLayout>
  )
}
