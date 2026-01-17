"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    } else {
      setIsDark(false)
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    if (newIsDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  if (!mounted) {
    return <div className="w-10 h-10 rounded-lg bg-secondary/50 animate-pulse" />
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-lg bg-secondary/80 hover:bg-secondary flex items-center justify-center transition-colors overflow-hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ y: -30, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 30, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Moon className="w-5 h-5 text-yellow-300" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: -30, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 30, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Sun className="w-5 h-5 text-amber-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated ring on toggle */}
      <motion.div
        className="absolute inset-0 rounded-lg border-2 border-primary/50"
        initial={false}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0] }}
        transition={{ duration: 0.4 }}
        key={isDark ? "dark-ring" : "light-ring"}
      />
    </motion.button>
  )
}
