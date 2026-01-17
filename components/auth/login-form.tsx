"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, CheckCircle2, Building2, ShoppingBag, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { signIn } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type UserType = "seller" | "buyer"

interface LoginFormProps {
  onPasswordFocusChange?: (focused: boolean) => void
}

export function LoginForm({ onPasswordFocusChange }: LoginFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<UserType>("seller")
  const [passkey, setPasskey] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Please enter your email")
      return
    }
    if (!password) {
      setError("Please enter your password")
      return
    }
    if (userType === "buyer" && !passkey.trim()) {
      setError("Passkey is required for buyers")
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn({
        email: email.trim(),
        password,
        userType,
        passkey: userType === "buyer" ? passkey.trim() : undefined,
      })

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else if (result.user) {
        toast.success("Logged in successfully!")
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordFocus = () => {
    setFocusedField("password")
    onPasswordFocusChange?.(true)
  }

  const handlePasswordBlur = () => {
    setFocusedField(null)
    onPasswordFocusChange?.(false)
  }

  const inputVariants = {
    focused: { scale: 1.02, boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.15)" },
    unfocused: { scale: 1, boxShadow: "none" },
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">I am a</Label>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            onClick={() => {
              setUserType("seller")
              setPasskey("")
              setError(null)
            }}
            className={cn(
              "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
              userType === "seller" ? "border-primary bg-primary/5" : "border-border/50 hover:border-border bg-card",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                userType === "seller" ? "bg-primary/10" : "bg-muted",
              )}
            >
              <ShoppingBag
                className={cn(
                  "w-5 h-5 transition-colors",
                  userType === "seller" ? "text-primary" : "text-muted-foreground",
                )}
              />
            </div>
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                userType === "seller" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Seller
            </span>
            <AnimatePresence>
              {userType === "seller" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute -top-2 -right-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary fill-primary/20" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => {
              setUserType("buyer")
              setPasskey("")
              setError(null)
            }}
            className={cn(
              "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
              userType === "buyer" ? "border-primary bg-primary/5" : "border-border/50 hover:border-border bg-card",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                userType === "buyer" ? "bg-primary/10" : "bg-muted",
              )}
            >
              <Building2
                className={cn(
                  "w-5 h-5 transition-colors",
                  userType === "buyer" ? "text-primary" : "text-muted-foreground",
                )}
              />
            </div>
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                userType === "buyer" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Buyer
            </span>
            <AnimatePresence>
              {userType === "buyer" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute -top-2 -right-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary fill-primary/20" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email address
        </Label>
        <motion.div
          className="relative"
          variants={inputVariants}
          animate={focusedField === "email" ? "focused" : "unfocused"}
          transition={{ duration: 0.2 }}
        >
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            className="pl-10 h-12 bg-card border-border/50 focus:border-primary transition-all duration-300"
            required
          />
          <AnimatePresence>
            {email.includes("@") && email.includes(".") && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Passkey Field - Only for Buyers */}
      <AnimatePresence>
        {userType === "buyer" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="passkey" className="text-sm font-medium text-foreground">
              Buyer Passkey <span className="text-destructive">*</span>
            </Label>
            <motion.div
              className="relative"
              variants={inputVariants}
              animate={focusedField === "passkey" ? "focused" : "unfocused"}
              transition={{ duration: 0.2 }}
            >
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="passkey"
                type="text"
                placeholder="Enter 10-digit passkey"
                value={passkey}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                  setPasskey(value)
                }}
                onFocus={() => setFocusedField("passkey")}
                onBlur={() => setFocusedField(null)}
                className="pl-10 h-12 bg-card border-border/50 focus:border-primary transition-all duration-300"
                required={userType === "buyer"}
                maxLength={10}
              />
              {passkey.length === 10 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </Label>
          <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
            Forgot password?
          </Link>
        </div>
        <motion.div
          className="relative"
          variants={inputVariants}
          animate={focusedField === "password" ? "focused" : "unfocused"}
          transition={{ duration: 0.2 }}
        >
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={handlePasswordFocus}
            onBlur={handlePasswordBlur}
            className="pl-10 pr-10 h-12 bg-card border-border/50 focus:border-primary transition-all duration-300"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <AnimatePresence mode="wait">
              {showPassword ? (
                <motion.div
                  key="hide"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <EyeOff className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="show"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Eye className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
          Remember me for 30 days
        </Label>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Button
          type="submit"
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all duration-300 group"
          disabled={isLoading}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </motion.div>
            ) : (
              <motion.div
                key="signin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                Sign in
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-background text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-border hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 bg-card text-foreground"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-border hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 bg-card text-foreground"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </Button>
        </motion.div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
          Sign up for free
        </Link>
      </p>
    </motion.form>
  )
}
