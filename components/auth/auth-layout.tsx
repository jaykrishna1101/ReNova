"use client"

import type React from "react"

import { motion } from "framer-motion"
import { ArrowLeft, Recycle } from "lucide-react"
import Link from "next/link"
import { AnimatedRobot } from "@/components/animated-robot"
import { ThemeToggle } from "@/components/theme-toggle"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  isPasswordFocused?: boolean
}

export function AuthLayout({ children, title, subtitle, isPasswordFocused = false }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <motion.div
        className="hidden lg:flex lg:w-1/2 xl:w-[45%] relative bg-secondary/30 border-r border-border overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(var(--primary) / 0.1) 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-between w-full p-8 lg:p-12">
          {/* Top - Back link and Logo */}
          <div className="w-full">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to home</span>
              </Link>
              <ThemeToggle />
            </div>

            <motion.div
              className="mt-8 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary shadow-lg">
                  <Recycle className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    Re<span className="text-primary">Nova</span>
                  </h2>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">E-Waste Solutions</p>
                </div>
              </div>
              <h1 className="text-xl xl:text-2xl font-semibold text-foreground leading-tight text-center text-balance">
                Transform e-waste into
                <span className="text-primary"> sustainable value</span>
              </h1>
            </motion.div>
          </div>

          {/* Center - Animated Robot */}
          <motion.div
            className="flex-1 flex items-center justify-center w-full py-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <AnimatedRobot isPasswordFocused={isPasswordFocused} />
          </motion.div>

          {/* Footer */}
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            © 2026 ReNova. Building a sustainable future.
          </motion.p>
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <motion.div
        className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-16 bg-background"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
                <Recycle className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Re<span className="text-primary">Nova</span>
                </h2>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground text-balance">{title}</h1>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
          </motion.div>

          {/* Form */}
          {children}
        </div>
      </motion.div>
    </div>
  )
}
