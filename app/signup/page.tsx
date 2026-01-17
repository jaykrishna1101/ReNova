"use client"

import { useState } from "react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join ReNova and start making a difference today"
      isPasswordFocused={isPasswordFocused}
    >
      <SignupForm onPasswordFocusChange={setIsPasswordFocused} />
    </AuthLayout>
  )
}
