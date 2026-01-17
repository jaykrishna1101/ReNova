"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Recycle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/ai-analysis", label: "AI Analysis" },
    { href: "/impact", label: "Impact" },
    { href: "/profile", label: "Profile" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Recycle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-wide">
              <span className="text-foreground">Re</span>
              <span className="text-primary">Nova</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-5">Start Selling</Button>
              </motion.div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground py-2 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <div className="flex items-center gap-2 py-2">
                  <ThemeToggle />
                  <span className="text-sm text-muted-foreground">Toggle theme</span>
                </div>
                <Link href="/login">
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Start Selling
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
