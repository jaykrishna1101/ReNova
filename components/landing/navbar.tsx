"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Recycle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { supabase } from "@/lib/supabase/client"
import { getCurrentUser, getUserProfile, signOut } from "@/lib/auth"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userName, setUserName] = useState<string>("")
  const router = useRouter()

  const navLinks = [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/sell", label: "Sell E-Waste" },
    { href: "#impact", label: "Impact", isScroll: true },
    ...(user ? [{ href: "/listings", label: "My Listings" }] : []),
  ]

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      if (currentUser) {
        const { profile } = await getUserProfile(currentUser.id)
        if (profile?.name) {
          setUserName(profile.name)
        }
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        getUserProfile(session.user.id).then(({ profile }) => {
          if (profile?.name) {
            setUserName(profile.name)
          }
        })
      } else {
        setUserName("")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setUserName("")
    router.push("/")
    router.refresh()
  }

  const getInitial = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

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
            {navLinks.map((link) => {
              if (link.isScroll) {
                return (
                  <button
                    key={link.href}
                    onClick={() => {
                      if (link.href.startsWith("#")) {
                        const element = document.getElementById(link.href.slice(1))
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" })
                        } else if (window.location.pathname === "/") {
                          window.location.href = link.href
                        } else {
                          window.location.href = `/${link.href}`
                        }
                      }
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                  >
                    {link.label}
                  </button>
                )
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link href="/profile">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center hover:bg-primary/90 transition-colors"
                    title={`${userName || user.email || "User"} - View Profile`}
                  >
                    {getInitial()}
                  </button>
                </motion.div>
              </Link>
            ) : (
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                Login
              </Button>
            </Link>
            )}
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
              {navLinks.map((link) => {
                if (link.isScroll) {
                  return (
                    <button
                      key={link.href}
                      onClick={() => {
                        setIsOpen(false)
                        if (link.href.startsWith("#")) {
                          const element = document.getElementById(link.href.slice(1))
                          if (element) {
                            element.scrollIntoView({ behavior: "smooth" })
                          } else if (window.location.pathname === "/") {
                            window.location.href = link.href
                          } else {
                            window.location.href = `/${link.href}`
                          }
                        }
                      }}
                      className="text-muted-foreground hover:text-foreground py-2 transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  )
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground py-2 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <div className="flex items-center gap-2 py-2">
                  <ThemeToggle />
                  <span className="text-sm text-muted-foreground">Toggle theme</span>
                </div>
                {user ? (
                  <Link href="/profile" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center text-sm">
                          {getInitial()}
                        </div>
                        <span>{userName || user.email || "Profile"}</span>
                      </div>
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                    Login
                  </Button>
                </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
